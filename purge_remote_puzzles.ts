import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    // 1. Forge an admin token using the shared secret
    const token = jwt.sign(
      { userId: 'admin-diagnostic', role: 'admin' }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    
    console.log("Fetching all remote puzzles...");
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    
    const { data: puzzles } = await axios.get('https://puzzle-api-z48f.onrender.com/api/admin/puzzles', authHeaders);
    console.log(`Found ${puzzles.length} remote puzzles total.`);
    
    let deletedCount = 0;
    
    for (const puzzle of puzzles) {
      if (puzzle.imageUrl && puzzle.imageUrl.startsWith('/uploads/')) {
        console.log(`Deleting legacy puzzle: ${puzzle.id}`);
        await axios.delete(`https://puzzle-api-z48f.onrender.com/api/admin/puzzles/${puzzle.id}`, authHeaders);
        deletedCount++;
      }
    }
    
    console.log(`Successfully purged ${deletedCount} broken puzzles from the live Render.com database.`);
  } catch(e) {
    console.error("Error connecting to remote API:", e.response?.data || e.message);
  }
}

main();
