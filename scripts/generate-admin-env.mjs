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
console.log('\n# Vercel CLI helper');
console.log(`printf "${email}" | vercel env add ADMIN_EMAIL production`);
console.log(`printf "${password}" | vercel env add ADMIN_PASSWORD production`);
console.log(`printf "${sessionSecret}" | vercel env add ADMIN_SESSION_SECRET production`);
