import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet';
import creds from './endless-fire-460619-i4-a2e8c1a5298a.json' with { type: 'json' };

// Initialize auth
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

export async function fetchAllStationsData(spreadsheetId, maxRows = 50) {
  try {
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();
    
    const allStations = [];
    console.log(`Found ${doc.sheetsByIndex.length} sheets in the spreadsheet`);
    
    // Iterate through all sheets
    for (const sheet of doc.sheetsByIndex) {
      console.log(`Processing sheet: ${sheet.title}`);
      
      // Load only the first part of the sheet to avoid timeout
      const rowsToProcess = Math.min(maxRows, sheet.rowCount);
      await sheet.loadCells(`A1:O${rowsToProcess}`);
      
      // Extract station metadata (first two rows)
      const stationData = {
        sheetTitle: sheet.title,
        stationName: sheet.getCell(0, 1).value || 'N/A',
        location: sheet.getCell(1, 1).value || 'N/A',
        coordinates: null,
        equipment: []
      };
      
      // Parse coordinates if location contains lat,lng
      if (stationData.location && stationData.location.includes(',')) {
        const coords = stationData.location.split(',').map(c => parseFloat(c.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          stationData.coordinates = {
            latitude: coords[0],
            longitude: coords[1]
          };
        }
      }
      
      // Find header row
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(10, rowsToProcess); i++) {
        const cellValue = sheet.getCell(i, 0).value;
        if (cellValue && cellValue.toString().toLowerCase().includes('name') && 
            cellValue.toString() !== 'Station Name') {
          headerRowIndex = i;
          break;
        }
      }
      
      if (headerRowIndex !== -1) {
        // Get headers
        const headers = [];
        for (let col = 0; col < sheet.columnCount; col++) {
          const headerCell = sheet.getCell(headerRowIndex, col);
          const headerValue = headerCell.value || '';
          if (headerValue.trim()) {
            headers.push(headerValue.trim());
          }
        }
        
        // Get equipment data
        for (let row = headerRowIndex + 1; row < rowsToProcess; row++) {
          const equipment = {};
          let hasData = false;
          
          for (let col = 0; col < headers.length; col++) {
            const cell = sheet.getCell(row, col);
            const cellValue = cell.value || '';
            equipment[headers[col]] = cellValue;
            if (cellValue) hasData = true;
          }
          
          // Only add equipment that has a name
          if (hasData && equipment.Name && equipment.Name.trim()) {
            stationData.equipment.push(equipment);
          }
        }
      }
      
      allStations.push(stationData);
      console.log(`  - Found ${stationData.equipment.length} equipment items`);
    }
    
    return allStations;
    
  } catch (error) {
    console.error('Error fetching all stations data:', error);
    throw error;
  }
}

// Main execution
async function main_test() {
  const spreadsheetId = '1s2T_kmmnFivfe-nQSI7rL9-WqNIMPw7BcrS7kTLj7hg';
  
  console.log('Fetching all station data...');
  const allStations = await fetchAllStationsData(spreadsheetId);
  
  console.log('\n=== STATIONS SUMMARY ===');
  console.log(`Total Stations: ${allStations.length}`);
  
  allStations.forEach((station, index) => {
    console.log(`\n--- Station ${index + 1}: ${station.sheetTitle} ---`);
    console.log(`Station Name: ${station.stationName}`);
    console.log(`Location: ${station.location}`);
    if (station.coordinates) {
      console.log(`Coordinates: ${station.coordinates.latitude}, ${station.coordinates.longitude}`);
    }
    console.log(`Equipment Count: ${station.equipment.length}`);
    
    if (station.equipment.length > 0) {
      console.log('Equipment List:');
      station.equipment.forEach((equipment, equipIndex) => {
        console.log(`  ${equipIndex + 1}. ${equipment.Name} (${equipment.Type}) - Status: ${equipment.Status || 'N/A'}`);
      });
    }
  });
  
  // Show sample JSON for first station
  if (allStations.length > 0) {
    console.log('\n=== SAMPLE STATION DATA (JSON) ===');
    console.log(JSON.stringify(allStations[0], null, 2));
  }
}

// main_test().catch(console.error);
