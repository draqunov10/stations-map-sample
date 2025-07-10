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

async function checkSheets() {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();
    
    console.log('Document title:', doc.title);
    console.log('Number of sheets:', doc.sheetsByIndex.length);
    
    console.log('\nSheet titles:');
    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.title} (${sheet.rowCount} rows, ${sheet.columnCount} cols)`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSheets();
