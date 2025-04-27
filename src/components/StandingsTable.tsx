'use client';

import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Standing, Matchup } from '../types/sleeper';
import { calculatePowerRankings } from '../utils/standings';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface StandingsTableProps {
  standings: Standing[];
  weeklyScores: Record<string, number[]>;
  matchups?: { [week: number]: Matchup[] };
  currentWeek?: number;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ 
  standings, 
  weeklyScores,
  matchups = {},
  currentWeek = 0
}) => {
  const [viewMode, setViewMode] = useState<'standings' | 'power'>('standings');
  
  // More robust offseason detection using multiple indicators
  const isOffseason = React.useMemo(() => {
    // Check if all team records are 0-0
    const allZeroRecords = standings.length > 0 && 
      standings.every(team => team.wins === 0 && team.losses === 0);
    
    // Check if points are all 0
    const allZeroPoints = standings.length > 0 && 
      standings.every(team => team.points_for === 0);
    
    // Check if weekly scores are empty or minimal
    const noWeeklyScores = Object.keys(weeklyScores).length === 0 ||
      Object.values(weeklyScores).every(scores => scores.length === 0);
    
    return allZeroRecords || allZeroPoints || noWeeklyScores;
  }, [standings, weeklyScores]);

  // Calculate power rankings
  const powerRankings = React.useMemo(() => {
    if (isOffseason || !matchups || Object.keys(matchups).length === 0) {
      return standings; // Return regular standings in offseason
    }
    
    return calculatePowerRankings(standings, matchups, currentWeek);
  }, [standings, matchups, currentWeek, isOffseason]);

  // Function to generate sparkline data
  const generateSparklineData = (userId: string) => {
    const scores = weeklyScores[userId] || [];
    
    return {
      labels: scores.map((_, i) => `Week ${i + 1}`),
      datasets: [
        {
          data: scores,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
          pointRadius: 0,
          borderWidth: 1,
          tension: 0.1,
        },
      ],
    };
  };
  
  // Sparkline options - minimalistic
  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };
  
  // Format streak as a string (e.g. W3 for 3-game win streak, L2 for 2-game losing streak)
  const formatStreak = (streak: number) => {
    if (isOffseason) {
      return '-';
    }
    
    if (streak > 0) {
      return `W${streak}`;
    } else if (streak < 0) {
      return `L${Math.abs(streak)}`;
    }
    return '-';
  };

  // Add the missing function to get the last 5 games
  const getLastFiveGames = (userId: string): ('W' | 'L' | '-')[] => {
    if (isOffseason || !weeklyScores[userId] || weeklyScores[userId].length === 0) {
      return ['-', '-', '-', '-', '-'];
    }
    
    // Get scores for the last 5 weeks
    const last5Weeks = weeklyScores[userId].slice(-5);
    
    // For each week, determine if the team won or lost
    // This is a simplified version - in a real app you'd need to compare against opponents
    return last5Weeks.map(score => {
      if (score === null) return '-';
      // This is an approximation - you need actual matchup data for real W/L
      return score > 100 ? 'W' : 'L';
    });
  };

  // Display teams based on view mode
  const teamsToDisplay = viewMode === 'standings' ? standings : powerRankings;

  return (
    <div>
      {isOffseason && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md">
          <p className="text-sm">It's currently the offseason. Standings will reset when the new season begins.</p>
        </div>
      )}
      
      {/* View mode toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md ${
                viewMode === 'standings'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600'
              }`}
              onClick={() => setViewMode('standings')}
            >
              Regular Standings
            </button>
            <button
              type="button"
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md ${
                viewMode === 'power'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600'
              }`}
              onClick={() => setViewMode('power')}
            >
              <span>Power Rankings</span>
              <span className={`ml-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                viewMode === 'power' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300'
              }`}>
                i
              </span>
            </button>
          </div>
        </div>
        
        {viewMode === 'power' && !isOffseason && (
          <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 rounded-md p-3 border border-gray-200 dark:border-dark-600">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium mb-2 text-primary-700 dark:text-primary-400">Power Rankings Explained</p>
                <p className="mb-2 text-xs">Power Rankings provide a more nuanced view of team strength beyond just win-loss records.</p>
              </div>
              <div className="px-2 py-1 bg-primary-100 dark:bg-primary-900/40 rounded-md text-xs font-medium text-primary-800 dark:text-primary-300">
                Updated Weekly
              </div>
            </div>
            
            <div className="mt-2 mb-1 font-medium text-xs text-gray-700 dark:text-gray-200">Formula Components:</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-white/50 dark:bg-dark-800/50 p-2 rounded border border-gray-200 dark:border-dark-600">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary-500 flex-shrink-0 mr-2"></div>
                  <span className="font-medium text-xs">Win Percentage (50%)</span>
                </div>
                <p className="text-xs mt-1">Team's win-loss record remains the most important factor in determining team strength.</p>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Calculated as wins ÷ total games played.</p>
              </div>
              
              <div className="bg-white/50 dark:bg-dark-800/50 p-2 rounded border border-gray-200 dark:border-dark-600">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-accent-500 flex-shrink-0 mr-2"></div>
                  <span className="font-medium text-xs">Total Points (30%)</span>
                </div>
                <p className="text-xs mt-1">Total points scored throughout the season help identify consistently high-scoring teams.</p>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Normalized against the highest-scoring team in the league.</p>
              </div>
              
              <div className="bg-white/50 dark:bg-dark-800/50 p-2 rounded border border-gray-200 dark:border-dark-600">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0 mr-2"></div>
                  <span className="font-medium text-xs">Recent Form (20%)</span>
                </div>
                <p className="text-xs mt-1">Performance in the last 3 weeks captures teams that are getting hot or cooling down.</p>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Normalized against the team with the best recent performance.</p>
              </div>
            </div>
            
            <div className="mt-3 text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md border border-yellow-200 dark:border-yellow-900/30">
              <span className="font-medium text-yellow-800 dark:text-yellow-300">Note:</span> Power Rankings attempt to predict future performance more accurately than traditional standings by balancing season-long results with recent trends.
            </div>
            
            <div className="mt-3">
              <button 
                type="button" 
                onClick={() => document.getElementById('power-rankings-details')?.classList.toggle('hidden')}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 flex items-center"
              >
                <span>View detailed calculation</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              <div id="power-rankings-details" className="hidden mt-2 text-xs p-3 bg-gray-50 dark:bg-dark-900 rounded-md border border-gray-200 dark:border-dark-700">
                <p className="mb-2 font-medium">Detailed Calculation Process:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><span className="font-medium">Win Percentage (50%):</span> wins ÷ (wins + losses + ties)</li>
                  <li>
                    <span className="font-medium">Points For (30%):</span> 
                    <ul className="list-disc pl-4 mt-1 mb-1">
                      <li>Find the max points scored by any team (maxPoints)</li>
                      <li>Normalize: yourPoints ÷ maxPoints</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-medium">Recent Performance (20%):</span>
                    <ul className="list-disc pl-4 mt-1 mb-1">
                      <li>Calculate average points over last 3 weeks</li>
                      <li>Find the team with highest average recent score</li>
                      <li>Normalize: yourRecentAvg ÷ maxRecentAvg</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-medium">Final Power Score:</span> 
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-2 mt-1 mb-1 rounded font-mono">
                      (winPct × 0.5) + (normalizedPoints × 0.3) + (recentPerformance × 0.2)
                    </div>
                  </li>
                </ol>
                <p className="mt-2 text-gray-600 dark:text-gray-400">The final score is between 0 and 1, converted to a 0-100 scale for display. Teams are then ranked from highest to lowest power score.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-dark-600">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                    {viewMode === 'power' ? 'Power Rank' : 'Team'}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Record
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    PF
                  </th>
                  {viewMode === 'power' && (
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Power Score
                    </th>
                  )}
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    PA
                  </th>
                  {viewMode === 'power' ? (
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Actual Rank
                    </th>
                  ) : (
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Streak
                    </th>
                  )}
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Last 5
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-600 bg-white dark:bg-dark-800">
                {teamsToDisplay.map((team, index) => {
                  const last5Games = getLastFiveGames(team.user_id);
                  // Use the existing streak formatter
                  const streakInfo = formatStreak(team.streak || 0);
                  const isWinStreak = team.streak > 0;
                  
                  // Find the actual rank when in power mode
                  const actualRank = viewMode === 'power' 
                    ? standings.find(s => s.user_id === team.user_id)?.rank || 0
                    : team.rank;
                    
                  // Get movement for power rankings (difference between power rank and actual rank)
                  const powerMovement = viewMode === 'power' 
                    ? team.rank - actualRank 
                    : 0;
                  
                  return (
                    <tr key={team.user_id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          {team.avatar && (
                            <img 
                              src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`} 
                              alt="Team avatar" 
                              className="h-8 w-8 rounded-full mr-2" 
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {team.team_name || team.username || `Team ${team.rank}`}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 flex items-center">
                              {viewMode === 'power' ? (
                                <>
                                  <span>Power Rank #{index + 1}</span>
                                  {powerMovement !== 0 && (
                                    <span className={`ml-1 text-xs ${powerMovement > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {powerMovement > 0 ? `↑${powerMovement}` : `↓${Math.abs(powerMovement)}`}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span>Rank #{team.rank}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="text-gray-900 dark:text-white">{team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}</div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {isOffseason ? '0.000' : ((team.wins / (team.wins + team.losses + team.ties)) || 0).toFixed(3)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {isOffseason ? '0.00' : (team.points_for || 0).toFixed(2)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">#{team.rank} in League</div>
                      </td>
                      {/* Power Score column (only shown in power rankings view) */}
                      {viewMode === 'power' && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <div className="font-medium text-primary-600 dark:text-primary-400">
                            {((team as any).powerScore * 100).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Out of 100
                          </div>
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {isOffseason ? '0.00' : (team.points_against || 0).toFixed(2)}
                        </div>
                      </td>
                      {viewMode === 'power' ? (
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            #{actualRank}
                          </span>
                        </td>
                      ) : (
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            isOffseason
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              : isWinStreak 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {streakInfo}
                          </span>
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex space-x-1">
                          {/* Hard-code dashes for Last 5 during offseason */}
                          {isOffseason ? (
                            <>
                              <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">-</span>
                              <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">-</span>
                              <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">-</span>
                              <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">-</span>
                              <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">-</span>
                            </>
                          ) : (
                            last5Games.map((game: 'W' | 'L' | '-', idx: number) => (
                              <span 
                                key={idx}
                                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                                  game === 'W' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : game === 'L' 
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {game}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable; 