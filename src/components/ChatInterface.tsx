import React, { useState, useRef, useEffect } from 'react';
import { Header } from './Header';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Message } from '../types/chat';
import { saveMessage, loadUserChats } from '../lib/chat';
import { generateResponse } from '../lib/api';
import { v4 as uuidv4 } from 'uuid';
import { LogOut, AlertCircle } from 'lucide-react';

interface ChatInterfaceProps {
  user: {
    userId: string;
    username: string;
  };
  onLogout: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await loadUserChats(user.userId);
        setMessages(chats);
      } catch (error) {
        console.error('Error loading chats:', error);
        setError('Failed to load chat history');
      }
    };

    loadChats();
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [user.userId]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    setError(null);
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(user.userId, userMessage);
    setIsLoading(true);

    let retryCount = 0;
    const maxRetries = 3;

    const attemptGeneration = async (): Promise<void> => {
      try {
        const response = await generateResponse(content);
        
        const assistantMessage: Message = {
          id: uuidv4(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        await saveMessage(user.userId, assistantMessage);
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
          retryTimeoutRef.current = setTimeout(attemptGeneration, delay);
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
          setError(errorMessage);
          const errorMsg: Message = {
            id: uuidv4(),
            content: 'Sorry, I encountered an error. Please try again.',
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          await saveMessage(user.userId, errorMsg);
          setIsLoading(false);
        }
      }
    };

    await attemptGeneration();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <Header />
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Welcome, {user.username}!</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 m-4 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex gap-2 items-center text-gray-400 p-4">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}