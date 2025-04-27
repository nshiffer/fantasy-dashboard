'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from './ui/Logo';
import { ThemeToggle } from './ui/ThemeToggle';

interface NavigationProps {
  leagueInfo?: {
    name?: string;
    avatar?: string;
    season?: string;
    teamCount?: number;
  };
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  leagueInfo,
  currentSection = '',
  onSectionChange,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const handleSectionClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
    setIsMenuOpen(false);
    window.location.hash = section;
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };
  
  // Add scroll event listener to change nav appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Main Navigation */}
      <nav className={`bg-gradient-to-r from-primary-700 to-primary-900 dark:from-dark-900 dark:to-dark-800 text-white transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo />
              
              {leagueInfo?.name && (
                <div className="hidden md:block ml-6 pl-6 border-l border-white/20">
                  <span className="text-sm text-white/70">League</span>
                  <h2 className="text-white font-semibold">{leagueInfo.name}</h2>
                </div>
              )}
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              <div className="flex items-baseline space-x-1">
                <NavLink 
                  href="/" 
                  active={currentSection === '' || currentSection === 'overview'}
                  onClick={() => handleSectionClick('overview')}
                >
                  Home
                </NavLink>
                <NavLink 
                  href="#standings" 
                  active={currentSection === 'standings'}
                  onClick={() => handleSectionClick('standings')}
                >
                  Standings
                </NavLink>
                <NavLink 
                  href="#matchups" 
                  active={currentSection === 'matchups'}
                  onClick={() => handleSectionClick('matchups')}
                >
                  Matchups
                </NavLink>
                <NavLink 
                  href="#top-scorers" 
                  active={currentSection === 'top-scorers'}
                  onClick={() => handleSectionClick('top-scorers')}
                >
                  Top Scorers
                </NavLink>
                <NavLink 
                  href="#roster-analysis" 
                  active={currentSection === 'roster-analysis'}
                  onClick={() => handleSectionClick('roster-analysis')}
                >
                  Roster Analysis
                </NavLink>
                <NavLink 
                  href="#draft-board" 
                  active={currentSection === 'draft-board'}
                  onClick={() => handleSectionClick('draft-board')}
                >
                  Draft Board
                </NavLink>
              </div>
              
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/20">
                <ThemeToggle />
                
                {leagueInfo && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors shadow-sm hover:shadow"
                    title="Log out of your league"
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Logout
                  </button>
                )}
              </div>
            </div>
            
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button 
                className="inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-600 dark:hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white transition-colors" 
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
        
        {/* Mobile menu with smooth transition */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } bg-primary-800 dark:bg-dark-800 shadow-inner`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink 
              href="/" 
              active={currentSection === '' || currentSection === 'overview'}
              onClick={() => handleSectionClick('overview')}
            >
              Home
            </MobileNavLink>
            <MobileNavLink 
              href="#standings" 
              active={currentSection === 'standings'}
              onClick={() => handleSectionClick('standings')}
            >
              Standings
            </MobileNavLink>
            <MobileNavLink 
              href="#matchups" 
              active={currentSection === 'matchups'}
              onClick={() => handleSectionClick('matchups')}
            >
              Matchups
            </MobileNavLink>
            <MobileNavLink 
              href="#top-scorers" 
              active={currentSection === 'top-scorers'}
              onClick={() => handleSectionClick('top-scorers')}
            >
              Top Scorers
            </MobileNavLink>
            <MobileNavLink 
              href="#roster-analysis" 
              active={currentSection === 'roster-analysis'}
              onClick={() => handleSectionClick('roster-analysis')}
            >
              Roster Analysis
            </MobileNavLink>
            <MobileNavLink 
              href="#draft-board" 
              active={currentSection === 'draft-board'}
              onClick={() => handleSectionClick('draft-board')}
            >
              Draft Board
            </MobileNavLink>
            
            {leagueInfo && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors text-white"
                title="Log out of your league"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
      
      {/* League info banner for small screens */}
      {leagueInfo?.name && (
        <div className="md:hidden bg-primary-800/90 dark:bg-dark-800/90 py-2 px-4 text-center">
          <span className="text-white text-sm font-medium">{leagueInfo.name}</span>
          {leagueInfo.season && (
            <span className="text-white/70 text-xs ml-2">{leagueInfo.season} Season</span>
          )}
        </div>
      )}
    </header>
  );
};

const NavLink: React.FC<{ 
  href: string; 
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode 
}> = ({ href, active, onClick, children }) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    className={`
      px-3 py-2 rounded-md text-sm font-medium
      transition-all duration-200
      ${active 
        ? 'bg-primary-600 text-white dark:bg-dark-700 shadow-sm' 
        : 'text-white/80 hover:text-white hover:bg-primary-600/50 dark:hover:bg-dark-700/70'}
    `}
  >
    {children}
  </a>
);

const MobileNavLink: React.FC<{ 
  href: string; 
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode 
}> = ({ href, active, onClick, children }) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    className={`
      block px-3 py-2 rounded-md text-base font-medium
      transition-all duration-200
      ${active 
        ? 'bg-primary-600 text-white dark:bg-dark-700' 
        : 'text-white/80 hover:text-white hover:bg-primary-600/50 dark:hover:bg-dark-700/70'}
    `}
  >
    {children}
  </a>
);

export default Navigation; 