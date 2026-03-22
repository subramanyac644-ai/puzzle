import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  try {
    // Generate a dummy file
    fs.writeFileSync('dummy.jpg', 'dummy content');
    const form = new FormData();
    form.append('level', 'easy');
    form.append('image', fs.createReadStream('dummy.jpg'));

    // Use localhost for local testing
    const token = jwt.sign({ userId: '9ab214c3-2124-48c3-a75b-c20d72dfa576', role: 'user' }, process.env.JWT_SECRET || 'secret');
    try {
      const res = await axios.post('http://localhost:3333/api/user/puzzles', form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Success! Status:", res.status);
      console.log("Data ID:", res.data.id, "Image length:", res.data.imageUrl?.length);
    } catch (err) {
      console.log("Status:", err.response?.status);
      console.log("Data:", err.response?.data);
      console.log("Message:", err.message);
    }
  } finally {
    if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg');
  }
}
test();