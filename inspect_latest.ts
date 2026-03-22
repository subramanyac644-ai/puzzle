import axios from 'axios';

async function main() {
  try {
    const { data } = await axios.get('https://puzzle-api-z48f.onrender.com/api/puzzles/easy');
    if (data && data.length > 0) {
      console.log(`Found ${data.length} puzzles.`);
      const p = data[0]; // newest
      console.log("Newest puzzle ID:", p.id);
      console.log("Length of imageUrl:", p.imageUrl?.length);
      console.log("Starts with:", p.imageUrl?.substring(0, 100));
      console.log("Ends with:", p.imageUrl?.substring(Math.max(0, p.imageUrl.length - 100)));
    } else {
      console.log("No puzzles found.");
    }
  } catch(e) { console.error("Error:", e.message); }
}
main();
