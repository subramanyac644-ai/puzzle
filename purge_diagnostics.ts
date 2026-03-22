import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    const token = jwt.sign({ userId: 'admin-diagnostic', role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    
    const { data: puzzles } = await axios.get('https://puzzle-api-z48f.onrender.com/api/admin/puzzles', authHeaders);
    
    let deletedCount = 0;
    
    for (const puzzle of puzzles) {
      if (puzzle.imageUrl && puzzle.imageUrl.length < 500) {
        console.log(`Deleting tiny diagnostic puzzle: ${puzzle.id}`);
        await axios.delete(`https://puzzle-api-z48f.onrender.com/api/admin/puzzles/${puzzle.id}`, authHeaders);
        deletedCount++;
      }
    }
    
    console.log(`Successfully purged ${deletedCount} diagnostic puzzles.`);
  } catch(e) {
    console.error("Error:", e.response?.data || e.message);
  }
}

main();
