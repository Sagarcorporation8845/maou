import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { ChatInterface } from './components/ChatInterface';
import { registerUser, loginUser } from './lib/auth';
import { initDatabase } from './lib/db';
import { saveUserData, getUserData, clearUserData } from './lib/storage';

export default function App() {
  const [user, setUser] = useState(getUserData());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const userData = await loginUser(username, password);
    setUser({ userId: userData.userId, username: userData.username });
    saveUserData(userData);
  };

  const handleRegister = async (username: string, password: string) => {
    const userData = await registerUser(username, password);
    setUser({ userId: userData.userId, username: userData.username });
    saveUserData(userData);
  };

  const handleLogout = () => {
    setUser(null);
    clearUserData();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {user ? (
        <ChatInterface user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
}