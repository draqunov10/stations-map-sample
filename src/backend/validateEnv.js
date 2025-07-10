import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Environment Variables Check:');
console.log('============================');

const requiredEnvVars = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
  'GOOGLE_PROJECT_ID',
  'GOOGLE_SPREADSHEET_ID'
];

let allValid = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✓ ${varName}: ${varName === 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY' ? '[PRIVATE KEY SET]' : value}`);
  } else {
    console.log(`✗ ${varName}: NOT SET`);
    allValid = false;
  }
});

console.log('\n============================');
if (allValid) {
  console.log('✓ All required environment variables are set!');
} else {
  console.log('✗ Some environment variables are missing.');
  console.log('Please check your .env file and ensure all required variables are set.');
}
