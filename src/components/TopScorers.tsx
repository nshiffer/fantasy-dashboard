'use client';

import React from 'react';
import { Matchup, Roster, User, Player } from '../types/sleeper';
import { getTeamOwner, getPlayerName } from '../services/sleeper-api';
import { isOnHotStreak } from '../utils/standings';

interface TopScorersProps {
  matchups: { [week: number]: Matchup[] };
  rosters: Roster[];
  users: User[];
  players: { [key: string]: Player };
  weeklyScores: Record<string, number[]>;
  currentWeek: number;
}

const TopScorers: React.FC<TopScorersProps> = ({
  matchups,
  rosters,
  users,
  players,
  weeklyScores,
  currentWeek,
}) => {
  // Get the top scorers for the current week
  const getWeekTopScorers = (week: number, limit: number = 5) => {
    const weekMatchups = matchups[week] || [];
    
    return [...weekMatchups]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, limit)
      .map(matchup => {
        const owner = getTeamOwner(matchup.roster_id, rosters, users);
        const onHotStreak = owner ? isOnHotStreak(weeklyScores[owner.user_id] || []) : false;
        
        return {
          points: matchup.points || 0,
          roster_id: matchup.roster_id,
          team_name: owner?.metadata?.team_name || owner?.display_name || 'Unknown Team',
          avatar: owner?.avatar || '',
          user_id: owner?.user_id || '',
          onHotStreak,
        };
      });
  };
  
  // Get the top scorers for the season
  const getSeasonTopScorers = (limit: number = 5) => {
    // Calculate total points for each roster
    const totalPoints: Record<number, { points: number; rosterId: number }> = {};
    
    Object.values(matchups).forEach(weekMatchups => {
      weekMatchups.forEach(matchup => {
        if (!totalPoints[matchup.roster_id]) {
          totalPoints[matchup.roster_id] = { points: 0, rosterId: matchup.roster_id };
        }
        
        totalPoints[matchup.roster_id].points += matchup.points || 0;
      });
    });
    
    return Object.values(totalPoints)
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map(total => {
        const owner = getTeamOwner(total.rosterId, rosters, users);
        const onHotStreak = owner ? isOnHotStreak(weeklyScores[owner.user_id] || []) : false;
        
        return {
          points: total.points,
          roster_id: total.rosterId,
          team_name: owner?.metadata?.team_name || owner?.display_name || 'Unknown Team',
          avatar: owner?.avatar || '',
          user_id: owner?.user_id || '',
          onHotStreak,
        };
      });
  };
  
  const weekTopScorers = getWeekTopScorers(currentWeek);
  const seasonTopScorers = getSeasonTopScorers();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-dark-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Week {currentWeek} Top Scorers</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Highest scoring teams this week</p>
        </div>
        <div className="border-t border-gray-200 dark:border-dark-700">
          <ul className="divide-y divide-gray-200 dark:divide-dark-700">
            {weekTopScorers.map((scorer, index) => (
              <li key={scorer.roster_id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white">
                      {index + 1}
                    </span>
                    <div className="ml-4 flex items-center">
                      {scorer.avatar && (
                        <img 
                          src={`https://sleepercdn.com/avatars/thumbs/${scorer.avatar}`} 
                          alt="Team avatar" 
                          className="h-8 w-8 rounded-full mr-2" 
                        />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{scorer.team_name}</span>
                      {scorer.onHotStreak && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                          🔥 Hot Streak
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {scorer.points != null ? scorer.points.toFixed(2) : '-'} pts
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-white dark:bg-dark-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Season Top Scorers</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Highest scoring teams this season</p>
        </div>
        <div className="border-t border-gray-200 dark:border-dark-700">
          <ul className="divide-y divide-gray-200 dark:divide-dark-700">
            {seasonTopScorers.map((scorer, index) => (
              <li key={scorer.roster_id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white">
                      {index + 1}
                    </span>
                    <div className="ml-4 flex items-center">
                      {scorer.avatar && (
                        <img 
                          src={`https://sleepercdn.com/avatars/thumbs/${scorer.avatar}`} 
                          alt="Team avatar" 
                          className="h-8 w-8 rounded-full mr-2" 
                        />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{scorer.team_name}</span>
                      {scorer.onHotStreak && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                          🔥 Hot Streak
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {scorer.points != null ? scorer.points.toFixed(2) : '-'} pts
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopScorers; 