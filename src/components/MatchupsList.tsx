'use client';

import React from 'react';
import { Matchup, Roster, User, Standing, Player } from '../types/sleeper';
import { getTeamOwner } from '../services/sleeper-api';
import { detectUpset } from '../utils/standings';

interface MatchupsListProps {
  matchups: Matchup[];
  rosters: Roster[];
  users: User[];
  standings: Standing[];
  players: Record<string, Player>;
  week: number;
  isUpcoming?: boolean;
}

const MatchupsList: React.FC<MatchupsListProps> = ({
  matchups,
  rosters,
  users,
  standings,
  players,
  week,
  isUpcoming = false,
}) => {
  // Group matchups by matchup_id
  const matchupPairs: Record<number, Matchup[]> = {};
  
  matchups.forEach((matchup) => {
    if (!matchup.matchup_id) return;
    
    if (!matchupPairs[matchup.matchup_id]) {
      matchupPairs[matchup.matchup_id] = [];
    }
    
    matchupPairs[matchup.matchup_id].push(matchup);
  });
  
  // Helper function to get team details
  const getTeamDetails = (rosterId: number) => {
    const roster = rosters.find(r => r.roster_id === rosterId);
    const user = users.find(u => roster?.owner_id === u.user_id);
    // Find standing that matches the user_id associated with this roster
    const standing = standings.find(s => s.user_id === user?.user_id);
    
    return {
      name: user?.metadata?.team_name || user?.display_name || `Team ${rosterId}`,
      avatar: user?.avatar,
      rank: standing?.rank || 0,
      wins: standing?.wins || 0,
      losses: standing?.losses || 0
    };
  };

  // Calculate win probability based on team records and stats
  const calculateWinProbability = (team1: ReturnType<typeof getTeamDetails>, team2: ReturnType<typeof getTeamDetails>) => {
    // Simple calculation based on ranking
    if (team1.rank === 0 || team2.rank === 0) return 50; // Equal chance if no rankings
    
    // Lower rank is better (rank 1 is the best)
    const team1Strength = 1 / team1.rank;
    const team2Strength = 1 / team2.rank;
    
    // Calculate probability based on relative strength
    const totalStrength = team1Strength + team2Strength;
    const team1Probability = (team1Strength / totalStrength) * 100;
    
    return Math.min(Math.max(team1Probability, 10), 90); // Clamp between 10% and 90% to avoid extremes
  };

  const getWinnerLoser = (matchupPair: Matchup[]) => {
    if (matchupPair.length !== 2) return { winner: null, loser: null };
    
    const [team1, team2] = matchupPair;
    
    if (team1.points > team2.points) {
      return { winner: team1, loser: team2 };
    } else if (team2.points > team1.points) {
      return { winner: team2, loser: team1 };
    }
    
    return { winner: null, loser: null }; // Tie
  };
  
  const isMatchupUpset = (matchupPair: Matchup[]) => {
    const { winner, loser } = getWinnerLoser(matchupPair);
    if (!winner || !loser) return false;
    
    const winnerTeam = getTeamDetails(winner.roster_id);
    const loserTeam = getTeamDetails(loser.roster_id);
    
    return detectUpset(winnerTeam.rank, loserTeam.rank);
  };

  return (
    <div className="space-y-6">
      {Object.values(matchupPairs).map((matchupPair, index) => {
        if (matchupPair.length !== 2) return null;
        
        const [team1, team2] = matchupPair;
        const team1Details = getTeamDetails(team1.roster_id);
        const team2Details = getTeamDetails(team2.roster_id);
        
        const upset = !isUpcoming && isMatchupUpset(matchupPair);
        const { winner } = !isUpcoming ? getWinnerLoser(matchupPair) : { winner: null };
        
        // Calculate win probability based on team records and stats
        const homeWinProb = calculateWinProbability(team1Details, team2Details);
        const awayWinProb = 100 - homeWinProb;
        
        return (
          <div key={index} className="bg-white dark:bg-dark-800 shadow-md rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Matchup {index + 1}</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50 dark:bg-dark-700 relative">
                  {team1Details.avatar && (
                    <img 
                      src={`https://sleepercdn.com/avatars/thumbs/${team1Details.avatar}`} 
                      alt="Team avatar" 
                      className={`h-16 w-16 rounded-full mb-2 ${winner?.roster_id === team1.roster_id ? 'ring-2 ring-green-500' : ''}`}
                    />
                  )}
                  <h4 className="text-lg font-bold text-dark-900 dark:text-white text-center">
                    {team1Details.name}
                  </h4>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-sm bg-gray-200 dark:bg-dark-600 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 flex items-center">
                      <span className="font-medium">{team1Details.rank}</span>
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
                    {team1.points != null ? team1.points.toFixed(2) : '-'}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-4 mb-2">
                    <div 
                      className="bg-primary-600 h-4 rounded-full" 
                      style={{ width: `${homeWinProb}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {homeWinProb.toFixed(1)}% win probability
                  </div>
                  
                  {upset && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                      Upset!
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50 dark:bg-dark-700 relative">
                  {team2Details.avatar && (
                    <img 
                      src={`https://sleepercdn.com/avatars/thumbs/${team2Details.avatar}`} 
                      alt="Team avatar" 
                      className={`h-16 w-16 rounded-full mb-2 ${winner?.roster_id === team2.roster_id ? 'ring-2 ring-green-500' : ''}`}
                    />
                  )}
                  <h4 className="text-lg font-bold text-dark-900 dark:text-white text-center">
                    {team2Details.name}
                  </h4>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-sm bg-gray-200 dark:bg-dark-600 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 flex items-center">
                      <span className="font-medium">{team2Details.rank}</span>
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
                    {team2.points != null ? team2.points.toFixed(2) : '-'}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-4 mb-2">
                    <div 
                      className="bg-secondary-600 h-4 rounded-full" 
                      style={{ width: `${awayWinProb}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {awayWinProb.toFixed(1)}% win probability
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MatchupsList; 