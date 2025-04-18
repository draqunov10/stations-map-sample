import React from 'react';
import PropTypes from 'prop-types';

const StationCard = ({ stationName, location, status, transmitterReading, onModify, onClick }) => {
  return (
    <div
      className="grid grid-cols-4 gap-4 border border-white p-4 rounded relative h-20 cursor-pointer items-center justify-items-center"
      onClick={onClick}
    >
      <div className="flex items-center justify-center h-full">{stationName}</div>
      <div className="flex items-center justify-center h-full">{location}</div>
      <div className="flex items-center justify-center h-full">{status}</div>
      <div className="flex items-center justify-center h-full">{transmitterReading} psi</div>
      <button className="absolute top-2 right-2" onClick={(e) => { e.stopPropagation(); onModify(); }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75v.008M12 12v.008M12 17.25v.008" />
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