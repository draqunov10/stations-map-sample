import React from 'react';
import PropTypes from 'prop-types';

const StationCard = ({ stationName, location, status, transmitterReading, onModify, onClick }) => {
  const borderColor = status === 'Online' ? 'border-green-500' : status === 'Offline' ? 'border-red-500' : 'border-white';
  const statusColor = status === 'Online' ? 'text-green-500' : status === 'Offline' ? 'text-red-500' : 'text-white';

  return (
    <div
      className={`bg-gray-800 border-l-4 ${borderColor} p-4 rounded-lg hover:bg-gray-750 transition-colors duration-200 cursor-pointer relative shadow-md`}
      onClick={onClick}
    >
      {/* Station Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${status === 'Online' ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
          <h3 className="text-lg font-semibold text-white">{stationName}</h3>
        </div>
        <button 
          className="text-gray-400 hover:text-white transition-colors p-1 rounded" 
          onClick={(e) => { e.stopPropagation(); onModify(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
      </div>
      
      {/* Station Details */}
      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <span className="text-gray-400 w-16 flex-shrink-0">Location:</span>
          <span className="text-gray-300 font-mono text-xs">{location}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-400 w-16 flex-shrink-0">Status:</span>
          <span className={`${statusColor} font-medium`}>{status}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-400 w-16 flex-shrink-0">Reading:</span>
          <span className="text-gray-300 font-medium">
            {status === 'Offline' ? 'N/A' : `${parseFloat(transmitterReading).toFixed(2)} psi`}
          </span>
        </div>
      </div>
    </div>
  );
};

StationCard.propTypes = {
  stationName: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  transmitterReading: PropTypes.number.isRequired,
  onModify: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default StationCard;