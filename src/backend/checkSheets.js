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

async function checkSheets() {
  try {
    const spreadsheetId = '1s2T_kmmnFivfe-nQSI7rL9-WqNIMPw7BcrS7kTLj7hg';
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
