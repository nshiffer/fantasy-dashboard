'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-primary-700 to-primary-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-xl font-bold hover:text-primary-200 transition duration-200">
              <span className="flex items-center">
                <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5H21V19H3V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Fantasy Dashboard
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <NavLink href="/">Home</NavLink>
              <NavLink href="#standings">Standings</NavLink>
              <NavLink href="#matchups">Matchups</NavLink>
              <NavLink href="#top-scorers">Top Scorers</NavLink>
              <NavLink href="#power-rankings">Power Rankings</NavLink>
              <NavLink href="#roster-analysis">Roster Analysis</NavLink>
              <NavLink href="#draft-board">Draft Board</NavLink>
            </div>
          </div>
          
          <div className="md:hidden">
            <button 
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, toggle based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-primary-800 shadow-inner`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
          <MobileNavLink href="#standings" onClick={() => setIsMenuOpen(false)}>Standings</MobileNavLink>
          <MobileNavLink href="#matchups" onClick={() => setIsMenuOpen(false)}>Matchups</MobileNavLink>
          <MobileNavLink href="#top-scorers" onClick={() => setIsMenuOpen(false)}>Top Scorers</MobileNavLink>
          <MobileNavLink href="#power-rankings" onClick={() => setIsMenuOpen(false)}>Power Rankings</MobileNavLink>
          <MobileNavLink href="#roster-analysis" onClick={() => setIsMenuOpen(false)}>Roster Analysis</MobileNavLink>
          <MobileNavLink href="#draft-board" onClick={() => setIsMenuOpen(false)}>Draft Board</MobileNavLink>
        </div>
      </div>
    </nav>
  );
};

// Helper component for desktop navigation links
const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link 
    href={href}
    className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-600 hover:text-white transition duration-150"
  >
    {children}
  </Link>
);

// Helper component for mobile navigation links
const MobileNavLink: React.FC<{ href: string; onClick: () => void; children: React.ReactNode }> = ({ href, onClick, children }) => (
  <Link 
    href={href}
    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-600 hover:text-white transition duration-150"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navigation; 