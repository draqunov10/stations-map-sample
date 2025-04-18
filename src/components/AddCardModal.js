import React from 'react';
import PropTypes from 'prop-types';

const AddCardModal = ({ onCancel, onAddCard, centerLocation }) => {
  const [formData, setFormData] = React.useState({
    stationName: '',
    status: 'Online',
    transmitterReading: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEnter = () => {
    onAddCard({ ...formData, location: centerLocation });
    onCancel();
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-4 rounded shadow-lg w-96 z-50">
      <div className="flex justify-end">
        <button onClick={onCancel} className="text-gray-300 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <input
          type="text"
          name="stationName"
          placeholder="Station Name"
          value={formData.stationName}
          onChange={handleInputChange}
          className="w-3/4 p-2 border border-gray-700 bg-gray-800 text-white rounded"
        />
        <p className="w-3/4 mx-auto p-2 border border-gray-700 bg-gray-800 text-white rounded text-center">Location: {centerLocation}</p>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          className="w-3/4 p-2 border border-gray-700 bg-gray-800 text-white rounded"
        />
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={handleEnter} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">Enter</button>
      </div>
    </div>
  );
};

AddCardModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onAddCard: PropTypes.func.isRequired,
  centerLocation: PropTypes.string.isRequired,
};

export default AddCardModal;