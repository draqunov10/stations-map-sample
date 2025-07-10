import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet';

import creds from './endless-fire-460619-i4-a2e8c1a5298a.json' with { type: 'json' }; // the file saved above

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
],
});

// ID taken from the URL of the Google Sheet
const doc = new GoogleSpreadsheet('1s2T_kmmnFivfe-nQSI7rL9-WqNIMPw7BcrS7kTLj7hg', serviceAccountAuth);
await doc.loadInfo(); // loads document properties and worksheets
console.log(doc.title);

const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
console.log(sheet.title);
console.log(sheet.rowCount);