'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Standing, Matchup } from '../types/sleeper';
import { calculatePowerRankings } from '../utils/standings';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface PowerRankingsProps {
  standings: Standing[];
  matchups: { [week: number]: Matchup[] };
  currentWeek: number;
}

const PowerRankings: React.FC<PowerRankingsProps> = ({ standings, matchups, currentWeek }) => {
  // Calculate power rankings
  const powerRankings = calculatePowerRankings(standings, matchups, currentWeek);
  
  // Function to determine movement in rankings (compare original rank to power rank)
  const getRankMovement = (userId: string) => {
    const originalStanding = standings.find(s => s.user_id === userId);
    const powerStanding = powerRankings.find(s => s.user_id === userId);
    
    if (!originalStanding || !powerStanding) return 0;
    
    return originalStanding.rank - powerStanding.rank;
  };
  
  // Function to generate movement indicator
  const getMovementIndicator = (movement: number) => {
    if (movement > 0) {
      return (
        <span className="inline-flex items-center text-green-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {movement}
        </span>
      );
    } else if (movement < 0) {
      return (
        <span className="inline-flex items-center text-red-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {Math.abs(movement)}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
        </svg>
      </span>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Power Rankings</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Based on record, points, and recent performance
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Power Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points For
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movement
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {powerRankings.map((team) => {
                const movement = getRankMovement(team.user_id);
                
                return (
                  <tr key={team.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {team.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {team.avatar && (
                          <img 
                            src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`} 
                            alt="Team avatar" 
                            className="h-8 w-8 rounded-full mr-2" 
                          />
                        )}
                        <span>{team.team_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.points_for != null ? team.points_for.toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {standings.find(s => s.user_id === team.user_id)?.rank || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getMovementIndicator(movement)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PowerRankings; 