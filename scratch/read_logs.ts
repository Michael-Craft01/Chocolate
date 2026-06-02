import fs from 'fs';

function readAndPrint(path: string) {
  if (!fs.existsSync(path)) {
    console.log(`File not found: ${path}`);
    return;
  }
  const buffer = fs.readFileSync(path);
  // Try utf-16le first, fallback to utf-8
  let text = buffer.toString('utf16le');
  if (text.includes('\uFFFD')) {
    text = buffer.toString('utf8');
  }
  console.log(`=== ${path} ===`);
  console.log(text.slice(-2000)); // Print last 2000 characters
}

readAndPrint('output.log');
readAndPrint('error.log');
readAndPrint('startup_error.log');
