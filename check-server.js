const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

async function checkServer() {
  try {
    console.log(`Trying to connect to ${API_URL}...`);
    const response = await fetch(API_URL);
    const data = await response.json();
    
    console.log('Server is running!');
    console.log('Status:', response.status);
    console.log('Response:', data);
    return true;
  } catch (error) {
    console.error('Error connecting to server:', error.message);
    console.log('The server may not be running. Please start it with:');
    console.log('  cd backend && npm run dev');
    return false;
  }
}

checkServer(); 