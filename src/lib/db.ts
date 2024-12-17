import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MaouDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      username: string;
      password: string;
      createdAt: Date;
    };
    indexes: { 'by-username': string };
  };
  chats: {
    key: string;
    value: {
      id: string;
      userId: string;
      content: string;
      role: 'user' | 'assistant';
      timestamp: Date;
    };
    indexes: { 'by-user': string };
  };
}

let db: IDBPDatabase<MaouDB>;

export async function initDatabase() {
  db = await openDB<MaouDB>('maou-chat', 1, {
    upgrade(db) {
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('by-username', 'username', { unique: true });

      const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
      chatStore.createIndex('by-user', 'userId');
    },
  });
  
  console.log('Database initialized successfully');
  return db;
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

export default { initDatabase, getDatabase };