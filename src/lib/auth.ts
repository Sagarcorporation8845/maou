import { generateToken, hashPassword, verifyPassword } from './crypto';
import { getDatabase } from './db';
import { v4 as uuidv4 } from 'uuid';

export async function registerUser(username: string, password: string) {
  const db = await getDatabase();
  
  const existingUser = await db.getFromIndex('users', 'by-username', username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const hashedPassword = await hashPassword(password);
  const userId = uuidv4();
  const token = generateToken();
  
  const user = {
    id: userId,
    username,
    password: hashedPassword,
    createdAt: new Date()
  };

  await db.add('users', user);
  return { userId, username, token };
}

export async function loginUser(username: string, password: string) {
  const db = await getDatabase();
  
  const user = await db.getFromIndex('users', 'by-username', username);
  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  const token = generateToken();
  return { token, userId: user.id, username: user.username };
}