import { getDatabase } from './db';
import { Message } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

export async function saveMessage(userId: string, message: Message) {
  const db = await getDatabase();
  await db.add('chats', {
    id: message.id,
    userId,
    content: message.content,
    role: message.role,
    timestamp: message.timestamp
  });
}

export async function loadUserChats(userId: string): Promise<Message[]> {
  const db = await getDatabase();
  const messages = await db.getAllFromIndex('chats', 'by-user', userId);
  
  return messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    timestamp: new Date(msg.timestamp)
  }));
}