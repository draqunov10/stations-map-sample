/* eslint-disable no-unused-vars */
import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize auth
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

export async function fetchAllStationsData(maxRows = 50) {
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
        // Get headers and deduplicate them
        const headers = [];
        const seenHeaders = new Set();
        
        for (let col = 0; col < sheet.columnCount; col++) {
          const headerCell = sheet.getCell(headerRowIndex, col);
          const headerValue = headerCell.value || '';
          const cleanHeader = headerValue.trim();
          
          if (cleanHeader && !seenHeaders.has(cleanHeader)) {
            headers.push(cleanHeader);
            seenHeaders.add(cleanHeader);
          }
        }
        
        // Get equipment data
        for (let row = headerRowIndex + 1; row < rowsToProcess; row++) {
          const equipment = {};
          let hasData = false;
          
          // Use a Set to track which columns we've already processed
          const processedColumns = new Set();
          
          for (let col = 0; col < headers.length; col++) {
            const header = headers[col];
            if (!header || processedColumns.has(header)) continue;
            
            processedColumns.add(header);
            
            const cell = sheet.getCell(row, col);
            const cellValue = cell.value || '';
            equipment[header] = cellValue;
            if (cellValue) hasData = true;
          }
          
          // Only add equipment that has a name and is not a duplicate
          if (hasData && equipment.Name && equipment.Name.trim()) {
            // Check if this equipment already exists in the station
            const existingEquipment = stationData.equipment.find(eq => 
              eq.Name && eq.Name.trim() === equipment.Name.trim()
            );
            
            if (!existingEquipment) {
              stationData.equipment.push(equipment);
            }
          }
          
          // Stop processing if we hit 10+ consecutive empty rows
          if (!hasData) {
            let emptyRowCount = 1;
            for (let checkRow = row + 1; checkRow < Math.min(row + 10, rowsToProcess); checkRow++) {
              let hasDataInRow = false;
              for (let checkCol = 0; checkCol < headers.length; checkCol++) {
                const checkCell = sheet.getCell(checkRow, checkCol);
                if (checkCell.value) {
                  hasDataInRow = true;
                  break;
                }
              }
              if (!hasDataInRow) {
                emptyRowCount++;
              } else {
                break;
              }
            }
            
            // If we found 5+ consecutive empty rows, stop processing
            if (emptyRowCount >= 5) {
              break;
            }
          }
        }
      }
      
      // Clean and deduplicate equipment data
      stationData.equipment = cleanEquipmentData(stationData.equipment);
      
      allStations.push(stationData);
      console.log(`  - Found ${stationData.equipment.length} equipment items`);
    }
    
    return allStations;
    
  } catch (error) {
    console.error('Error fetching all stations data:', error);
    throw error;
  }
}

// Helper function to clean and deduplicate equipment data
function cleanEquipmentData(equipment) {
  const cleaned = [];
  const seenNames = new Set();
  
  for (const item of equipment) {
    if (!item.Name || !item.Name.trim()) continue;
    
    const name = item.Name.trim();
    if (seenNames.has(name)) continue;
    
    seenNames.add(name);
    
    // Clean up the equipment object and remove duplicate keys
    const cleanedItem = {};
    const processedKeys = new Set();
    
    for (const [key, value] of Object.entries(item)) {
      // Skip if we've already processed this key
      if (processedKeys.has(key)) continue;
      
      processedKeys.add(key);
      
      // Only include non-empty values or convert empty strings to null for better JSON
      const cleanValue = value && value.toString().trim() ? value.toString().trim() : null;
      cleanedItem[key] = cleanValue;
    }
    
    cleaned.push(cleanedItem);
  }
  
  return cleaned;
}

async function fetchStationData() {
  const response = await fetch(`https://script.google.com/macros/s/AKfycbzs0dJDAYK9mhTMdGBrawynn2Em2KB1tnBp5U9XKY-HOKFe47BuY20pfq7FyDPs1RnW/exec`, {
    method: 'POST',
    mode: 'cors', // This prevents CORS errors but limits response access
  })
  return await response.json();
}

// Main execution
async function main_test() {
  console.log('Fetching all station data...');
  const allStations = await fetchStationData();
  
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
