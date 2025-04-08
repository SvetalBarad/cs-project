const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000';
let authToken = null;

// Sample user credentials for registration/login
const user = {
  name: 'Physics Teacher',
  email: 'teacher@example.com',
  password: 'Password123!'
};

// Function to register a new user
async function register() {
  try {
    console.log('Registering user...');
    console.log(`POST ${API_URL}/auth/register`);
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });

    const data = await response.json();
    console.log('Registration response status:', response.status);
    console.log('Registration response:', data);
    
    if (data.token) {
      console.log('✅ Registration successful!');
      authToken = data.token;
      return true;
    } else {
      console.log('❌ Registration failed. Trying to login...');
      return false;
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    console.log('Server might not be running. Please make sure the backend server is started.');
    return false;
  }
}

// Function to login
async function login() {
  try {
    console.log('Logging in...');
    console.log(`POST ${API_URL}/auth/login`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    });

    const data = await response.json();
    console.log('Login response status:', response.status);
    console.log('Login response:', data);
    
    if (data.token) {
      console.log('✅ Login successful!');
      authToken = data.token;
      return true;
    } else {
      console.log('❌ Login failed.');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error.message);
    console.log('Server might not be running. Please make sure the backend server is started.');
    return false;
  }
}

// Function to check server status
async function checkServerStatus() {
  try {
    console.log('Checking if server is running...');
    console.log(`GET ${API_URL}`);
    
    const response = await fetch(`${API_URL}`, { timeout: 5000 });
    console.log('Server status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Server check error:', error.message);
    console.log('❌ Server is not running. Please start the backend server with: cd backend && npm run dev');
    return false;
  }
}

// Function to upload a PDF file
async function uploadPDF(filePath, title, description) {
  if (!authToken) {
    console.log('No auth token. Please login or register first.');
    return false;
  }

  try {
    console.log(`Uploading ${path.basename(filePath)}...`);
    console.log(`POST ${API_URL}/upload`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', fs.createReadStream(filePath));
    
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    const data = await response.json();
    console.log('Upload response status:', response.status);
    console.log('Upload response:', data);
    
    if (data.success) {
      console.log(`✅ Successfully uploaded: ${title}`);
      return true;
    } else {
      console.log(`❌ Failed to upload: ${title}`);
      return false;
    }
  } catch (error) {
    console.error('Upload error:', error.message);
    return false;
  }
}

// Function to get all resources
async function getResources() {
  try {
    console.log('Getting all resources...');
    console.log(`GET ${API_URL}/resources`);
    
    const response = await fetch(`${API_URL}/resources`);
    const data = await response.json();
    
    console.log('Resources count:', data.count);
    
    if (data.data && data.data.length > 0) {
      console.log('Resource titles:');
      data.data.forEach((resource, index) => {
        console.log(`  ${index + 1}. ${resource.title}`);
      });
    } else {
      console.log('No resources found.');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Get resources error:', error.message);
    return [];
  }
}

// Main function to run everything
async function main() {
  console.log('=== PDF Upload Script ===');
  
  // Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    return;
  }
  
  // First try to register, if that fails, try to login
  let authenticated = await register();
  if (!authenticated) {
    authenticated = await login();
  }
  
  if (!authenticated) {
    console.log('❌ Could not authenticate. Exiting...');
    return;
  }
  
  // Upload PDFs
  const pdfsToUpload = [
    {
      path: path.join(__dirname, 'sample-resources', 'quantum_physics.pdf'),
      title: 'Introduction to Quantum Physics',
      description: 'A comprehensive overview of key quantum physics concepts including wave-particle duality, uncertainty principle, and quantum entanglement.'
    },
    {
      path: path.join(__dirname, 'sample-resources', 'thermodynamics.pdf'),
      title: 'Fundamentals of Thermodynamics',
      description: 'Detailed explanation of the four laws of thermodynamics and their applications in various fields of science and engineering.'
    },
    {
      path: path.join(__dirname, 'sample-resources', 'calculus_basics.pdf'),
      title: 'Introduction to Calculus',
      description: 'Basic concepts of differential and integral calculus with examples and applications in physics and engineering.'
    }
  ];
  
  console.log('\n=== Uploading Files ===');
  for (const pdf of pdfsToUpload) {
    await uploadPDF(pdf.path, pdf.title, pdf.description);
  }
  
  // Get all resources to verify uploads
  console.log('\n=== Resource Summary ===');
  const resources = await getResources();
  console.log('----------------------------');
  console.log(`Total resources available: ${resources.length}`);
  console.log('----------------------------');
  
  console.log('\n✅ Script complete!');
  console.log('Please open api-test.html in your browser to see and interact with the uploaded resources.');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error.message);
}); 
main().catch(console.error); 