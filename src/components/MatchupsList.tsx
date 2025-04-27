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
  
  // Get team details for a roster
  const getTeamDetails = (rosterId: number) => {
    const owner = getTeamOwner(rosterId, rosters, users);
    
    if (!owner) {
      return {
        name: 'Unknown Team',
        avatar: '',
        rank: 0,
      };
    }
    
    const standing = standings.find(s => s.user_id === owner.user_id);
    
    return {
      name: owner.metadata?.team_name || owner.display_name,
      avatar: owner.avatar,
      rank: standing?.rank || 0,
    };
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {isUpcoming ? `Week ${week} Upcoming Matchups` : `Week ${week} Results`}
      </h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(matchupPairs).map((matchupPair, index) => {
          if (matchupPair.length !== 2) return null;
          
          const [team1, team2] = matchupPair;
          const team1Details = getTeamDetails(team1.roster_id);
          const team2Details = getTeamDetails(team2.roster_id);
          
          const upset = !isUpcoming && isMatchupUpset(matchupPair);
          const { winner } = !isUpcoming ? getWinnerLoser(matchupPair) : { winner: null };
          
          return (
            <div 
              key={index} 
              className={`bg-white overflow-hidden shadow rounded-lg ${upset ? 'border-2 border-yellow-400' : ''}`}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Matchup {index + 1}</span>
                  {upset && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                      Upset!
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    {team1Details.avatar && (
                      <img 
                        src={`https://sleepercdn.com/avatars/thumbs/${team1Details.avatar}`} 
                        alt="Team avatar" 
                        className={`h-12 w-12 rounded-full ${winner?.roster_id === team1.roster_id ? 'ring-2 ring-green-500' : ''}`}
                      />
                    )}
                    <span className="text-sm font-medium text-center">{team1Details.name}</span>
                    <span className="text-xs text-gray-500">Rank #{team1Details.rank}</span>
                    <span className="text-xl font-bold">{team1.points != null ? team1.points.toFixed(2) : '-'}</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-400">vs</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    {team2Details.avatar && (
                      <img 
                        src={`https://sleepercdn.com/avatars/thumbs/${team2Details.avatar}`} 
                        alt="Team avatar" 
                        className={`h-12 w-12 rounded-full ${winner?.roster_id === team2.roster_id ? 'ring-2 ring-green-500' : ''}`}
                      />
                    )}
                    <span className="text-sm font-medium text-center">{team2Details.name}</span>
                    <span className="text-xs text-gray-500">Rank #{team2Details.rank}</span>
                    <span className="text-xl font-bold">{team2.points != null ? team2.points.toFixed(2) : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchupsList; 