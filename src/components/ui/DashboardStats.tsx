'use client';

import React from 'react';
import { Standing, League } from '../../types/sleeper';

interface DashboardStatsProps {
  league: League | null;
  standings: Standing[];
  currentWeek: number;
  totalTeams: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  league,
  standings,
  currentWeek,
  totalTeams
}) => {
  // Calculate some interesting stats
  const highestScorer = standings.length > 0 
    ? standings.reduce((prev, current) => (prev.points_for > current.points_for) ? prev : current) 
    : null;
  
  const isPlayoffs = league?.settings?.playoff_week_start 
    ? currentWeek >= league.settings.playoff_week_start
    : false;
  
  const totalPointsScored = standings.reduce((sum, team) => sum + team.points_for, 0);
  const avgPointsPerTeam = totalTeams > 0 ? (totalPointsScored / totalTeams).toFixed(2) : '0';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* League Status */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-700 dark:to-primary-900 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center">
          <div className="p-3 bg-white/20 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">League Status</p>
            <p className="text-xl font-bold">
              {isPlayoffs ? 'Playoffs' : league?.status === 'in_season' ? `Week ${currentWeek}` : 'Off Season'}
            </p>
          </div>
        </div>
        <div className="mt-2 text-white/80 text-sm">
          {league?.name || 'Fantasy League'}
        </div>
      </div>
      
      {/* Teams */}
      <div className="bg-gradient-to-br from-accent-500 to-accent-700 dark:from-accent-600 dark:to-accent-800 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center">
          <div className="p-3 bg-white/20 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Teams</p>
            <p className="text-xl font-bold">{totalTeams}</p>
          </div>
        </div>
        <div className="mt-2 text-white/80 text-sm">
          {league?.settings?.type === 2 ? 'Dynasty' : 'Redraft'} Format
        </div>
      </div>
      
      {/* Top Scorer */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 dark:from-green-600 dark:to-green-800 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center">
          <div className="p-3 bg-white/20 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Top Scorer</p>
            <p className="text-xl font-bold">
              {highestScorer ? (highestScorer.team_name || 'Team ' + highestScorer.rank) : 'N/A'}
            </p>
          </div>
        </div>
        <div className="mt-2 text-white/80 text-sm">
          {highestScorer ? `${highestScorer.points_for.toFixed(2)} Points` : '-'}
        </div>
      </div>
      
      {/* Average Score */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-600 dark:to-amber-800 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center">
          <div className="p-3 bg-white/20 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Avg Points</p>
            <p className="text-xl font-bold">{avgPointsPerTeam}</p>
          </div>
        </div>
        <div className="mt-2 text-white/80 text-sm">
          Per Team
        </div>
      </div>
    </div>
  );
};

export default DashboardStats; 