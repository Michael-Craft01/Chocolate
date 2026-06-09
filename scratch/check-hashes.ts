import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function getMd5(filePath: string) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

const logoPath = path.resolve('frontend/public/logo.png');
const vercelPath = path.resolve('frontend/public/vercel.png');
const appIconPath = path.resolve('frontend/src/app/icon.png');
const appFaviconPath = path.resolve('frontend/src/app/favicon.ico');

console.log('logo.png md5:', getMd5(logoPath));
console.log('vercel.png md5:', getMd5(vercelPath));
console.log('app/icon.png md5:', getMd5(appIconPath));
console.log('app/favicon.ico md5:', getMd5(appFaviconPath));
