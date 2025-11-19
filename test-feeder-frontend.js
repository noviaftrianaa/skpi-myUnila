// Test Feeder API from Browser Console
// Copy and paste this to browser console when you're on the feeder-integrator page

console.log('=== Testing Feeder API ===');

// Get token from localStorage
const token = localStorage.getItem('auth_access_token');
console.log('Token exists:', !!token);
console.log('Token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'NO TOKEN');

// Test 1: Feeder Stats
console.log('\n--- Test 1: Feeder Mahasiswa Stats ---');
fetch('http://localhost:9800/feeder-service/api/v1/mahasiswa/stats', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('Stats Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Stats Response:', data);
  if (data.success) {
    console.log('✅ SUCCESS: Feeder stats loaded');
  } else {
    console.log('❌ FAILED: Feeder stats failed', data.message);
  }
})
.catch(err => {
  console.error('❌ ERROR: Feeder stats error:', err);
});

// Test 2: Feeder Mahasiswa List
console.log('\n--- Test 2: Feeder Mahasiswa List ---');
fetch('http://localhost:9800/feeder-service/api/v1/mahasiswa?page=1&limit=5', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('List Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('List Response:', data);
  if (data.success) {
    console.log('✅ SUCCESS: Feeder list loaded, total:', data.data?.total);
  } else {
    console.log('❌ FAILED: Feeder list failed', data.message);
  }
})
.catch(err => {
  console.error('❌ ERROR: Feeder list error:', err);
});

// Test 3: Compare with Sister API
console.log('\n--- Test 3: Sister API (for comparison) ---');
fetch('http://localhost:9800/sister-service/api/v1/dosen/stats', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('Sister Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Sister Response:', data);
  if (data.success) {
    console.log('✅ SUCCESS: Sister stats loaded');
  } else {
    console.log('❌ FAILED: Sister stats failed', data.message);
  }
})
.catch(err => {
  console.error('❌ ERROR: Sister stats error:', err);
});

console.log('\n=== Tests Initiated - Check results above ===');
