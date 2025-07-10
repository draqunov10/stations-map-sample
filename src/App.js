import './styles/App.css';
import './components/AddCardModal';
import './icons/greenIcon';
import './icons/redIcon';
import './icons/markerIconConfig';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import DefaultIcon from './icons/markerIconConfig';
import AddCardModal from './components/AddCardModal';
import greenIcon from './icons/greenIcon';
import redIcon from './icons/redIcon';
import StationCard from './components/StationCard';
import ModifyCardModal from './components/ModifyCardModal';
import sampleStations from './backend/sample_stations.json';

// Apply the default marker icon globally
L.Marker.prototype.options.icon = DefaultIcon;

// Helper function to determine station status based on equipment
const getStationStatus = (equipment) => {
  const runningEquipment = equipment.filter(eq => eq.Status === 'RUN');
  const faultEquipment = equipment.filter(eq => eq.Status === 'FAULT');
  
  if (faultEquipment.length > 0) return 'Offline';
  if (runningEquipment.length > 0) return 'Online';
  return 'Offline';
};

// Helper function to get transmitter reading
const getTransmitterReading = (equipment) => {
  const transmitter = equipment.find(eq => eq.Name === 'Pressure Transmitter');
  return transmitter ? parseFloat(transmitter.Reading || 0) : 0;
};

function App() {
  const mapRef = useRef(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [stationCardData, setStationCardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [centerLocation, setCenterLocation] = useState('');
  const [isModifyingCard, setIsModifyingCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // For Google Apps Script, try GET first with no-cors mode
        const response = await fetch(`https://script.google.com/macros/s/AKfycbzs0dJDAYK9mhTMdGBrawynn2Em2KB1tnBp5U9XKY-HOKFe47BuY20pfq7FyDPs1RnW/exec`, {
          method: 'POST',
          mode: 'cors', // This prevents CORS errors but limits response access
        });
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        // Set the fetched data if it's an array
        if (Array.isArray(data) && data.length > 0) {
          setStationCardData(data);
        } else {
          console.log('Invalid data format, using fallback');
          loadFallbackData();
        }
        
      } catch (error) {
        console.error('Fetch error:', error);
        console.log('Using fallback data - fetch failed due to CORS or network issues');
        loadFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFallbackData = () => {
      // Use the imported sample stations data
      setStationCardData(sampleStations);
    };

    fetchData();
  }, []); // Empty dependency array means it runs once on mount

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([14.168243, 121.153708], 15);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapRef.current);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Labels &copy; Esri &mdash; Source: Esri, HERE, Garmin, FAO, NOAA, USGS, EPA, NPS'
      }).addTo(mapRef.current);

      // Add markers for each card location
      stationCardData.forEach(station => {
        const [lat, lng] = station.location.split(',').map(coord => parseFloat(coord.trim()));
        const status = getStationStatus(station.equipment);
        const icon = status === 'Online' ? greenIcon : redIcon;
        L.marker([lat, lng], { icon }).addTo(mapRef.current).bindPopup(`<b>${station.stationName}</b><br>${station.location}`);
      });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stationCardData]);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;

      const updateCenterMarker = () => {
        const center = map.getCenter();
        setCenterLocation(`${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
        if (!map._centerMarker) {
          map._centerMarker = L.marker(center, { draggable: true }).addTo(map);
        } else {
          map._centerMarker.setLatLng(center);
        }
      };

      if (isAddingCard) {
        map.on('move', updateCenterMarker);

        // Initialize the center marker
        updateCenterMarker();
      }

      return () => {
        map.off('move', updateCenterMarker);
        if (map._centerMarker) {
          map.removeLayer(map._centerMarker);
          delete map._centerMarker;
        }
      };
    }
  }, [isAddingCard]);

  const handleAddButtonClick = () => {
    setIsAddingCard(true);
  };

  const handleCancelAddCard = () => {
    setIsAddingCard(false);
  };

  const handleAddCard = (newCard) => {
    setStationCardData([...stationCardData, newCard]);

    // Add a new marker to the map for the new card
    if (mapRef.current) {
      const [lat, lng] = newCard.location.split(',').map(coord => parseFloat(coord.trim()));
      const status = getStationStatus(newCard.equipment);
      const icon = status === 'Online' ? greenIcon : redIcon;
      L.marker([lat, lng], { icon }).addTo(mapRef.current).bindPopup(`<b>${newCard.stationName}</b><br>${newCard.location}`);
    }
  };

  const handleModifyButtonClick = (station) => {
    setSelectedCard(station);
    setIsModifyingCard(true);

    // Center the map at the marker's location
    if (mapRef.current) {
      const [lat, lng] = station.location.split(',').map(coord => parseFloat(coord.trim()));
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  };

  const handleCancelModifyCard = () => {
    setIsModifyingCard(false);
    setSelectedCard(null);
  };

  const handleSaveModifiedCard = (updatedCard) => {
    if (updatedCard === null) {
      // Remove the selected card if updatedCard is null
      setStationCardData((prevData) =>
        prevData.filter((card) => card.stationName !== selectedCard.stationName)
      );
    } else {
      // Update the card data
      setStationCardData((prevData) =>
        prevData.map((card) =>
          card.stationName === selectedCard.stationName ? updatedCard : card
        )
      );
    }
    setIsModifyingCard(false);
    setSelectedCard(null);
  };

  const handleCardClick = (station) => {
    if (mapRef.current) {
      const [lat, lng] = station.location.split(',').map(coord => parseFloat(coord.trim()));
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  };

  const mapModalStyle = {
    position: 'absolute',
    bottom: '5%',
    transform: 'translateX(-50%)',
  };

  const calculateMapOffset = () => {
    const mapElement = document.getElementById('map');
    return mapElement ? mapElement.offsetLeft : 0;
  };

  return (
    <div className="App" style={{ display: 'flex', height: '100vh' }}>
      <div className="bg-gray-900 text-white p-4 flex flex-col" style={{ width: '30%' }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-white"></div>
            <h3 className="text-2xl font-extrabold">Sample App</h3>
          </div>
          <div className="flex space-x-2">
            <button
              className={`bg-gray-700 p-2 pl-4 rounded-full hover:bg-gray-600 flex items-center space-x-2 ${isAddingCard || isModifyingCard ? 'pointer-events-none opacity-50' : ''}`}
              onClick={handleAddButtonClick}
            >
              <span className="text-white">Add Station</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Stations Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Stations</h2>
          <div className="h-px bg-gray-600"></div>
        </div>
        
        {/* Station Cards */}
        <div className={`flex-1 overflow-y-auto space-y-3 pr-2 station-cards-container ${isAddingCard || isModifyingCard ? 'pointer-events-none opacity-50' : ''}`}>
          {isLoading ? (
            // Loading Animation
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-gray-300 font-medium">Loading Stations...</p>
                <p className="text-gray-500 text-sm mt-1">Fetching data from server</p>
              </div>
            </div>
          ) : (
            stationCardData.map((station, index) => (
              <StationCard
                key={index}
                station={station}
                stationName={station.stationName}
                location={station.location}
                status={getStationStatus(station.equipment)}
                transmitterReading={getTransmitterReading(station.equipment)}
                onModify={() => handleModifyButtonClick(station)}
                onClick={() => handleCardClick(station)}
              />
            ))
          )}
        </div>
      </div>
      <div id="map" style={{ flex: 1 }}></div>

      {isAddingCard && (
        <div
          style={{
            ...mapModalStyle,
            left: `calc(35% + ${calculateMapOffset()}px)`
          }}
        >
          <AddCardModal onCancel={handleCancelAddCard} onAddCard={handleAddCard} centerLocation={centerLocation} />
        </div>
      )}

      {isModifyingCard && (
        <div
          style={{
            ...mapModalStyle,
            left: `calc(35% + ${calculateMapOffset()}px)`
          }}
        >
          <ModifyCardModal
            stationData={selectedCard}
            onCancel={handleCancelModifyCard}
            onSave={handleSaveModifiedCard}
            mapRef={mapRef} // Pass the mapRef to ModifyCardModal
          />
        </div>
      )}
      <p className="text-sm text-gray-400 absolute bottom-2 left-2">Sample by Led Salazar</p>
    </div>
  );
}

export default App;
