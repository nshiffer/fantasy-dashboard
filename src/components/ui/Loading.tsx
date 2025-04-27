'use client';

import React from 'react';
import { Logo } from './Logo';

interface LoadingProps {
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 flex items-center justify-center animate-bounce">
          <Logo />
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <p className="text-lg font-medium text-primary-700 dark:text-primary-300">{text}</p>
        
        {/* Loading bar */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-pulse"
            style={{ width: '60%' }}
          />
        </div>
        
        <div className="loading-dots flex space-x-1 mt-2">
          <span className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></span>
          <span className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-ping" style={{ animationDelay: '600ms' }}></span>
        </div>
      </div>
    </div>
  );
};

export default Loading; 