const fs = require('fs');
const path = require('path');
console.log('--- CJS TEST ---');
console.log('__dirname:', __dirname);
console.log('cwd:', process.cwd());
try {
  const files = fs.readdirSync(__dirname);
  console.log('Files in __dirname:', files);
} catch (e) {
  console.log('Error listing __dirname:', e.message);
}
