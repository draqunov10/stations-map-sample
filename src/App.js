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

// Apply the default marker icon globally
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const mapRef = useRef(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [stationCardData, setStationCardData] = useState([
    { stationName: 'TPH', location: '14.165081, 121.162698', status: 'Online', transmitterReading: 120.21 },
    { stationName: 'BP1', location: '14.171842, 121.158299', status: 'Online', transmitterReading: 130.50 },
    { stationName: 'BP2', location: '14.171364, 121.162666', status: 'Offline', transmitterReading: 110 },
    { stationName: 'DW1', location: '14.174718, 121.152125', status: 'Online', transmitterReading: 125.75 },
    { stationName: 'DW4', location: '14.176632, 121.149480', status: 'Offline', transmitterReading: 0 },
    { stationName: 'DW2', location: '14.172050, 121.140575', status: 'Online', transmitterReading: 115.50 },
  ]);
  const [centerLocation, setCenterLocation] = useState('');
  const [isModifyingCard, setIsModifyingCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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
      stationCardData.forEach(data => {
        const [lat, lng] = data.location.split(',').map(coord => parseFloat(coord.trim()));
        const icon = data.status === 'Online' ? greenIcon : redIcon;
        L.marker([lat, lng], { icon }).addTo(mapRef.current).bindPopup(`<b>${data.stationName}</b><br>${data.location}`);
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
      const icon = newCard.status === 'Online' ? greenIcon : redIcon;
      L.marker([lat, lng], { icon }).addTo(mapRef.current).bindPopup(`<b>${newCard.stationName}</b><br>${newCard.location}`);
    }
  };

  const handleModifyButtonClick = (card) => {
    setSelectedCard(card);
    setIsModifyingCard(true);

    // Center the map at the marker's location
    if (mapRef.current) {
      const [lat, lng] = card.location.split(',').map(coord => parseFloat(coord.trim()));
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

  const handleCardClick = (card) => {
    if (mapRef.current) {
      const [lat, lng] = card.location.split(',').map(coord => parseFloat(coord.trim()));
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
      <div className="bg-gray-900 text-white p-4" style={{ width: '30%' }}>
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
        <div className="grid grid-cols-4 text-center font-bold mb-4 items-center">
          <div>Station Name</div>
          <div>Location</div>
          <div>Status</div>
          <div>Transmitter Reading</div>
        </div>
        <div className={`space-y-4 ${isAddingCard || isModifyingCard ? 'pointer-events-none opacity-50' : ''}`}>
          {stationCardData.map((data, index) => (
            <StationCard
              key={index}
              stationName={data.stationName}
              location={data.location}
              status={data.status}
              transmitterReading={data.transmitterReading}
              onModify={() => handleModifyButtonClick(data)}
              onClick={() => handleCardClick(data)}
            />
          ))}
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
