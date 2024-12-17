import React from 'react';
import { Heart } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Chat with Maou</h1>
          <p className="text-sm text-gray-400">Your intelligent friend 💕</p>
        </div>
      </div>
    </div>
  );
};