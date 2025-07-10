import PropTypes from 'prop-types';

const StationCard = ({ station, stationName, location, status, transmitterReading, onModify, onClick }) => {
  const borderColor = status === 'Online' ? 'border-green-500' : status === 'Offline' ? 'border-red-500' : 'border-white';
  const statusColor = status === 'Online' ? 'text-green-500' : status === 'Offline' ? 'text-red-500' : 'text-white';

  // Get running pumps count
  const runningPumps = station.equipment.filter(eq => eq.Type === 'Submersible' && eq.Status === 'RUN').length;
  const totalPumps = station.equipment.filter(eq => eq.Type === 'Submersible').length;
  const faultPumps = station.equipment.filter(eq => eq.Type === 'Submersible' && eq.Status === 'FAULT').length;

  return (
    <div
      className={`bg-gray-800 border border-gray-700 border-l-4 ${borderColor} p-4 rounded-lg hover:bg-gray-750 transition-colors duration-200 cursor-pointer relative shadow-md`}
      onClick={onClick}
    >
      {/* Station Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`w-3 h-3 rounded-full ${status === 'Online' ? 'bg-green-500' : 'bg-red-500'} shadow-sm flex-shrink-0`}></div>
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white">{stationName}</h3>
            <span className="text-gray-300 font-mono text-xs">({location})</span>
          </div>
        </div>
        <button 
          className="text-gray-400 hover:text-white transition-colors p-1 rounded flex-shrink-0" 
          onClick={(e) => { e.stopPropagation(); onModify(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
      </div>
      
      {/* Station Details */}
      <div className="space-y-3">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-gray-400">Sheet</span>
            <span className="text-gray-300 font-medium truncate">{station.sheetTitle}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">Status</span>
            <span className={`${statusColor} font-medium`}>{status}</span>
          </div>
        </div>

        {/* Equipment Summary */}
        <div className="border-t border-gray-600 pt-3">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-700">
            <span className="text-gray-400 text-xs font-medium tracking-wide">EQUIPMENT</span>
            <span className="text-xs text-gray-500">{station.equipment.length} items</span>
          </div>
          
          {/* Pumps Section */}
          <div className="mb-3 pb-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-xs font-medium">Pumps ({totalPumps})</span>
              <div className="flex space-x-2 text-xs">
                <span className="text-green-400">{runningPumps} RUN</span>
                {faultPumps > 0 && <span className="text-red-400">{faultPumps} FAULT</span>}
                <span className="text-gray-400">{totalPumps - runningPumps - faultPumps} STOP</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {station.equipment.filter(eq => eq.Type === 'Submersible').map((pump, idx) => (
                <div key={idx} className="bg-gray-750 border border-gray-600 rounded px-2 py-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 truncate">{pump.Name}</span>
                    <span className={`px-1 rounded text-xs font-medium border ${
                      pump.Status === 'RUN' ? 'bg-green-600 border-green-500 text-white' : 
                      pump.Status === 'FAULT' ? 'bg-red-600 border-red-500 text-white' : 
                      'bg-gray-600 border-gray-500 text-gray-300'
                    }`}>
                      {pump.Status}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {pump.Capacity} • {pump.Controller}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transmitters Section */}
          <div className="mb-3 pb-3 border-b border-gray-700">
            <span className="text-gray-300 text-xs font-medium block mb-2">Transmitters</span>
            <div className="space-y-1">
              {station.equipment.filter(eq => eq.Type === 'In-Line').map((transmitter, idx) => (
                <div key={idx} className="bg-gray-750 border border-gray-600 rounded px-2 py-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{transmitter.Name}</span>
                    <span className="text-blue-400 font-medium px-1 border border-blue-500 rounded">
                      {transmitter.Reading || '0'} {transmitter.Range ? transmitter.Range.split('-')[1] : ''}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs">Range: {transmitter.Range || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Equipment */}
          {station.equipment.filter(eq => eq.Type !== 'Submersible' && eq.Type !== 'In-Line').length > 0 && (
            <div className="mb-3">
              <span className="text-gray-300 text-xs font-medium block mb-2">Other Equipment</span>
              <div className="space-y-1">
                {station.equipment.filter(eq => eq.Type !== 'Submersible' && eq.Type !== 'In-Line').map((equipment, idx) => (
                  <div key={idx} className="bg-gray-750 border border-gray-600 rounded px-2 py-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">{equipment.Name}</span>
                      <span className="text-yellow-400 font-medium px-1 border border-yellow-500 rounded">
                        {equipment.Reading || 'N/A'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">{equipment.Type} • {equipment.Range || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

StationCard.propTypes = {
  station: PropTypes.shape({
    sheetTitle: PropTypes.string,
    stationName: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    coordinates: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }).isRequired,
    equipment: PropTypes.arrayOf(PropTypes.shape({
      Name: PropTypes.string.isRequired,
      Type: PropTypes.string,
      Range: PropTypes.string,
      Reading: PropTypes.string,
      Capacity: PropTypes.string,
      Controller: PropTypes.string,
      "Rated Voltage": PropTypes.string,
      "Rated Current (A)": PropTypes.string,
      "Voltage Reading": PropTypes.string,
      "Current Reading": PropTypes.string,
      "Frequency Reading": PropTypes.string,
      Status: PropTypes.string,
      "Last Runtime": PropTypes.string,
      "Running Hrs": PropTypes.string,
      "Number of Start": PropTypes.string,
    })).isRequired,
  }).isRequired,
  stationName: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  transmitterReading: PropTypes.number.isRequired,
  onModify: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default StationCard;