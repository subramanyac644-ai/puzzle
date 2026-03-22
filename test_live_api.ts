import axios from 'axios';

async function main() {
  try {
    console.log("Fetching from live API...");
    const { data } = await axios.get('https://puzzle-api-z48f.onrender.com/api/puzzles/easy');
    
    if (data && data.length > 0) {
      const p = data[0]; // newest
      console.log(`Found puzzle: ${p.id}`);
      console.log(`Level: ${p.level}`);
      console.log(`Image URL type:`, typeof p.imageUrl);
      if (typeof p.imageUrl === 'string') {
        console.log(`Image URL length:`, p.imageUrl.length);
        console.log(`Starts with:`, p.imageUrl.substring(0, 100));
        console.log(`Ends with:`, p.imageUrl.substring(p.imageUrl.length - 50));
      }
    } else {
      console.log("No puzzles found for level 'easy'");
    }
  } catch(e) { console.error("Error fetching live API:", e.message); }
}

main();
