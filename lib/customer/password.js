import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const PASSWORD_KEY_LENGTH = 64;

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function hashCustomerPassword(password) {
  const salt = randomBytes(24).toString('base64url');
  const hash = scryptSync(String(password), salt, PASSWORD_KEY_LENGTH).toString('base64url');
  return `scrypt:v1:${salt}:${hash}`;
}

export function verifyCustomerPassword(password, storedHash) {
  const parts = String(storedHash || '').split(':');
  if (parts.length !== 4 || parts[0] !== 'scrypt' || parts[1] !== 'v1') return false;
  const [, , salt, expectedHash] = parts;
  const actualHash = scryptSync(String(password), salt, PASSWORD_KEY_LENGTH).toString('base64url');
  return safeEqual(actualHash, expectedHash);
}
