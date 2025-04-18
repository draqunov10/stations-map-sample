import React from 'react';
import PropTypes from 'prop-types';

const StationCard = ({ stationName, location, status, transmitterReading, onModify, onClick }) => {
  const borderColor = status === 'Online' ? 'border-green-500' : status === 'Offline' ? 'border-red-500' : 'border-white';
  const statusColor = status === 'Online' ? 'text-green-500' : status === 'Offline' ? 'text-red-500' : 'text-white';

  return (
    <div
      className={`grid grid-cols-4 gap-4 border ${borderColor} p-4 rounded relative h-20 cursor-pointer items-center justify-items-center text-sm`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center h-full">{stationName}</div>
      <div className="flex items-center justify-center h-full">{location}</div>
      <div className={`flex items-center justify-center h-full ${statusColor}`}>{status}</div>
      <div className="flex items-center justify-center h-full">
        {status === 'Offline' ? '-' : `${parseFloat(transmitterReading).toFixed(2)} psi`}
      </div>
      <button className="absolute top-0.5 right-0.5" onClick={(e) => { e.stopPropagation(); onModify(); }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 27 27" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h.008M12 12h.008M18 12h.008" />
        </svg>
      </button>
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