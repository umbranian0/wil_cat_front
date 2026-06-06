import { randomBytes } from 'crypto';

function randomBase64Url(byteLength = 32) {
  return randomBytes(byteLength).toString('base64url');
}

function valueFor(name, value) {
  return `${name}=${value}`;
}

const emailArg = process.argv.find((arg) => arg.startsWith('--email='));
const email = emailArg ? emailArg.split('=').slice(1).join('=').trim() : 'owner@example.com';
const password = `${randomBase64Url(12)}-${randomBase64Url(12)}`;
const sessionSecret = randomBase64Url(48);

const lines = [
  valueFor('ADMIN_EMAIL', email),
  valueFor('ADMIN_PASSWORD', password),
  valueFor('ADMIN_SESSION_SECRET', sessionSecret),
];

console.log(lines.join('\n'));
console.log('\n# Cloudinary media variables');
console.log('CLOUDINARY_CLOUD_NAME=<your_cloud_name>');
console.log('CLOUDINARY_API_KEY=<your_api_key>');
console.log('CLOUDINARY_API_SECRET=<your_api_secret>');
console.log('CLOUDINARY_UPLOAD_FOLDER=wild-cat/products');
console.log('CLOUDINARY_MAX_UPLOAD_MB=5');
console.log('NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL=/images/pannel.png');
console.log('\n# Vercel CLI helper');
console.log(`printf "${email}" | vercel env add ADMIN_EMAIL production`);
console.log(`printf "${password}" | vercel env add ADMIN_PASSWORD production`);
console.log(`printf "${sessionSecret}" | vercel env add ADMIN_SESSION_SECRET production`);
console.log('printf "<your_cloud_name>" | vercel env add CLOUDINARY_CLOUD_NAME production');
console.log('printf "<your_api_key>" | vercel env add CLOUDINARY_API_KEY production');
console.log('printf "<your_api_secret>" | vercel env add CLOUDINARY_API_SECRET production');
console.log('printf "wild-cat/products" | vercel env add CLOUDINARY_UPLOAD_FOLDER production');
console.log('printf "5" | vercel env add CLOUDINARY_MAX_UPLOAD_MB production');
console.log('printf "/images/pannel.png" | vercel env add NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL production');
