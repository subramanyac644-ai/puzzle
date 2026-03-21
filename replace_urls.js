const fs = require('fs');
const path = require('path');

const OLD_URL = 'http://localhost:3333';
const NEW_URL = 'https://puzzle-api-z48f.onrender.com';

const dirs = [
  'apps/image-puzzle/src/app/components/Leaderboard',
  'apps/image-puzzle/src/app/components/ImagePuzzle',
  'apps/image-puzzle/src/app/components/Game',
  'apps/image-puzzle/src/app/components/Dashboard',
  'apps/image-puzzle/src/app/components/Auth',
  'apps/image-puzzle/src/app/components/Admin'
];

let replacedCount = 0;

for (const dir of dirs) {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(dirPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(OLD_URL)) {
        content = content.split(OLD_URL).join(NEW_URL);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
        replacedCount++;
      }
    }
  }
}

console.log(`Successfully replaced URL in ${replacedCount} files!`);
