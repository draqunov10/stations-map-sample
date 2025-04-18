import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';

const ModifyCardModal = ({ stationData, onCancel, onSave, mapRef }) => {
  const [formData, setFormData] = useState({ ...stationData });

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;

      const updateCenterMarker = () => {
        const center = map.getCenter();
        setFormData((prevData) => ({
          ...prevData,
          location: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
        }));
        if (!map._centerMarker) {
          map._centerMarker = L.marker(center, { draggable: true }).addTo(map);
        } else {
          map._centerMarker.setLatLng(center);
        }
      };

      map.on('move', updateCenterMarker);

      // Initialize the center marker
      updateCenterMarker();

      return () => {
        map.off('move', updateCenterMarker);
        if (map._centerMarker) {
          map.removeLayer(map._centerMarker);
          delete map._centerMarker;
        }
      };
    }
  }, [mapRef]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect this station?')) {
      onSave(null); // Pass null to indicate the card should be removed
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-4 rounded shadow-lg w-96 z-50">
      <div className="flex justify-between">
        <button onClick={onCancel} className="text-gray-300 hover:text-white mb-2 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button onClick={handleDisconnect} className="text-red-500 hover:text-red-700 ml-4 mb-4 text-lg">
          Disconnect
        </button>
      </div>
      <div className="space-y-4">
        <input
          type="text"
          name="stationName"
          placeholder="Station Name"
          value={formData.stationName}
          onChange={handleChange}
          className="w-3/4 p-2 border border-gray-700 bg-gray-800 text-white rounded"
        />
        <p className="w-3/4 mx-auto p-2 border border-gray-700 bg-gray-800 text-white rounded text-center">Location: {formData.location}</p>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-3/4 p-2 border border-gray-700 bg-gray-800 text-white rounded"
        >
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
        <input
          type="number"
          name="transmitterReading"
          placeholder="Transmitter Reading (psi)"
          value={formData.transmitterReading}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*(\.\d{0,2})?$/.test(value)) {
              handleChange(e);
            }
          }}
          className="w-3/4 p-2 border border-gray-700 bg-gray-800 text-white rounded"
        />
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={handleSave} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">Save</button>
      </div>
    </div>
  );
};

ModifyCardModal.propTypes = {
  stationData: PropTypes.shape({
    stationName: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    transmitterReading: PropTypes.number.isRequired,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  mapRef: PropTypes.object.isRequired,
};

export default ModifyCardModal;