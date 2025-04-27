'use client';

import React from 'react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center text-lg font-bold hover:opacity-90 transition duration-200">
      <div className="relative h-10 w-10 mr-2 overflow-hidden group">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-110">
          {/* Background with gradient */}
          <circle cx="32" cy="32" r="30" className="fill-primary-800 dark:fill-primary-900 transition-all duration-500" />
          
          {/* Football shape with better shadow */}
          <ellipse 
            cx="32" 
            cy="32" 
            rx="24" 
            ry="18" 
            transform="rotate(-15 32 32)" 
            className="fill-primary-600 dark:fill-primary-700 transition-colors duration-300" 
            filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.3))"
          />
          
          {/* Football texture with improved styling */}
          <g className="opacity-90">
            {/* Lacing with animation */}
            <rect 
              x="30" 
              y="18" 
              width="4" 
              height="28" 
              rx="2" 
              transform="rotate(-15 30 18)" 
              className="fill-white dark:fill-white/90 group-hover:fill-white/100 transition-all duration-300" 
            />
            
            {/* Horizontal lines with hover effect */}
            <path 
              d="M18 26.5C18 25.6716 18.6716 25 19.5 25H45.5C46.3284 25 47 25.6716 47 26.5C47 27.3284 46.3284 28 45.5 28H19.5C18.6716 28 18 27.3284 18 26.5Z" 
              transform="rotate(-15 32 32)" 
              className="fill-white/60 dark:fill-white/50 group-hover:fill-white/70 transition-all duration-300" 
            />
            <path 
              d="M18 37.5C18 36.6716 18.6716 36 19.5 36H45.5C46.3284 36 47 36.6716 47 37.5C47 38.3284 46.3284 39 45.5 39H19.5C18.6716 39 18 38.3284 18 37.5Z" 
              transform="rotate(-15 32 32)" 
              className="fill-white/60 dark:fill-white/50 group-hover:fill-white/70 transition-all duration-300" 
            />
          </g>
          
          {/* Chart line overlay with animation */}
          <g className="opacity-80">
            <path 
              d="M14 38L22 32L30 36L40 28L50 32" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-accent-500 dark:text-accent-400 group-hover:text-accent-600 dark:group-hover:text-accent-300 transition-all duration-300" 
              filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))"
            />
            <circle cx="22" cy="32" r="2" className="fill-accent-500 dark:fill-accent-400 group-hover:fill-accent-300 transition-all duration-300" />
            <circle cx="30" cy="36" r="2" className="fill-accent-500 dark:fill-accent-400 group-hover:fill-accent-300 transition-all duration-300" />
            <circle cx="40" cy="28" r="2" className="fill-accent-500 dark:fill-accent-400 group-hover:fill-accent-300 transition-all duration-300" />
          </g>
          
          {/* Enhanced shine effect */}
          <path 
            d="M20 15C20 12.2386 22.2386 10 25 10H32C42 10 52 20 52 32C52 46 40 52 32 52C18 52 12 40 12 32C12 26 14 20 20 15Z" 
            className="fill-white/10 dark:fill-white/5 group-hover:fill-white/15 dark:group-hover:fill-white/10 transition-all duration-500" 
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-lg leading-tight text-white font-bold transition-all duration-300 group-hover:text-white/90">Fantasy</span>
        <span className="text-base leading-tight text-white/90 font-medium transition-all duration-300 group-hover:text-white">Dashboard</span>
      </div>
    </Link>
  );
} 