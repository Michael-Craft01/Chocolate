import fs from 'fs';
import path from 'path';

function getPngDimensions(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

try {
  const logoPath = path.resolve('frontend/public/logo.png');
  const devPath = path.resolve('frontend/public/developer.png');
  const vercelPath = path.resolve('frontend/public/vercel.png');

  console.log('logo.png dimensions:', getPngDimensions(logoPath));
  console.log('developer.png dimensions:', getPngDimensions(devPath));
  console.log('vercel.png dimensions:', getPngDimensions(vercelPath));
} catch (e: any) {
  console.error('Error:', e.message);
}
