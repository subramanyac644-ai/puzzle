import axios from 'axios';

async function testAuth() {
  const ts = Date.now();
  const username = `testuser_${ts}`;
  const password = `password123`;
  
  try {
    const res = await axios.post('http://localhost:3333/api/auth/register', { username, password });
    console.log("Register Success:", res.status);
  } catch(err) {
    console.error("Register Error:", err.message);
    if(err.response) console.error("Response:", err.response.data);
  }

  try {
    const res = await axios.post('http://localhost:3333/api/auth/login', { username, password });
    console.log("Login Success!");
  } catch(err) {
    console.error("Login Error:", err.message);
    if(err.response) console.error("Response:", err.response.data);
  }
}
testAuth();
