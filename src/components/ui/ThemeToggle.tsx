'use client';

import { useState } from 'react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isDark = theme === 'dark';

  return (
    <button
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      type="button"
      className={`
        relative overflow-hidden w-9 h-9 p-2 rounded-lg
        ${isDark ? 'text-amber-300' : 'text-primary-100'}
        hover:bg-white/10 focus:outline-none
        transition-all duration-300 ease-in-out transform
        ${isHovered ? 'scale-110' : 'scale-100'}
      `}
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sun icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className={`
          absolute inset-0 h-5 w-5 m-2
          transition-all duration-500 ease-in-out
          ${isDark 
            ? 'opacity-0 rotate-90 scale-50'
            : 'opacity-100 rotate-0 scale-100'
          }
        `}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      
      {/* Moon icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className={`
          absolute inset-0 h-5 w-5 m-2
          transition-all duration-500 ease-in-out
          ${isDark 
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-50'
          }
        `}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
      
      {/* Background glow effect */}
      <span
        className={`
          absolute inset-0 rounded-full
          transition-all duration-700 ease-in-out
          ${isDark 
            ? 'bg-amber-300/10 opacity-100'
            : 'bg-blue-300/0 opacity-0'
          }
          ${isHovered ? 'scale-100' : 'scale-0'}
        `}
      ></span>
    </button>
  );
} 