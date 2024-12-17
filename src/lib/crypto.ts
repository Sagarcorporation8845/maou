// Browser-compatible crypto functions
import { v4 as uuidv4 } from 'uuid';

export function generateToken(): string {
  return `${uuidv4()}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}