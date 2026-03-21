import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function test() {
  try {
    // Generate a dummy file
    fs.writeFileSync('dummy.jpg', 'dummy content');
    const form = new FormData();
    form.append('level', 'easy');
    form.append('image', fs.createReadStream('dummy.jpg'));
    
    const token = 'dummy_token'; // Even with a dummy token it should return 401, not 404 or nothing
    try {
      await axios.post('http://localhost:3333/api/user/puzzles', form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      });
    } catch(err) {
      console.log("Status:", err.response?.status);
      console.log("Data:", err.response?.data);
      console.log("Message:", err.message);
    }
  } finally {
    if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg');
  }
}
test();
