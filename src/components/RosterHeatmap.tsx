'use client';

import React, { useState } from 'react';
import { Matchup, Roster, User, Player } from '../types/sleeper';
import { getTeamOwner, getPlayerName } from '../services/sleeper-api';

interface RosterHeatmapProps {
  matchups: { [week: number]: Matchup[] };
  rosters: Roster[];
  users: User[];
  players: { [key: string]: Player };
  currentWeek: number;
}

const RosterHeatmap: React.FC<RosterHeatmapProps> = ({
  matchups,
  rosters,
  users,
  players,
  currentWeek,
}) => {
  const [selectedRosterId, setSelectedRosterId] = useState<number | null>(null);
  
  // Define default roster positions if not available in data
  const defaultPositions = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'DST'];
  
  // Get all roster positions from league data
  const rosterPositions = rosters[0]?.roster_positions || defaultPositions;
  
  // Get utilization data for a specific roster
  const getUtilizationData = (rosterId: number) => {
    const utilizationByPosition: Record<string, { optimalCount: number, totalWeeks: number }> = {};
    
    // Initialize utilization for each position
    rosterPositions.forEach((position: string) => {
      utilizationByPosition[position] = { optimalCount: 0, totalWeeks: 0 };
    });
    
    // Process each week's matchup
    for (let week = 1; week <= currentWeek; week++) {
      const weekMatchups = matchups[week] || [];
      const matchup = weekMatchups.find(m => m.roster_id === rosterId);
      
      if (!matchup) continue;
      
      // Get the starters for this week
      const starters = matchup.starters || [];
      
      // Increment total weeks for each position
      starters.forEach((starterId, index) => {
        const position = index < rosterPositions.length ? rosterPositions[index] : 'FLEX';
        
        if (utilizationByPosition[position]) {
          utilizationByPosition[position].totalWeeks++;
          
          // For now, consider every starter as "optimal" (we can make this more sophisticated later)
          // In a real implementation, we would check if this was the best player for this position
          utilizationByPosition[position].optimalCount++;
        }
      });
    }
    
    return utilizationByPosition;
  };
  
  // Calculate utilization percentage
  const calculateUtilizationPercentage = (optimal: number, total: number) => {
    if (total === 0) return 0;
    return (optimal / total) * 100;
  };
  
  // Get CSS class for heatmap cell based on utilization percentage
  const getHeatmapClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-green-400';
    if (percentage >= 50) return 'bg-yellow-400';
    if (percentage >= 25) return 'bg-orange-400';
    return 'bg-red-400';
  };
  
  // Get selected roster data or first roster if none selected
  const selectedRoster = selectedRosterId 
    ? rosters.find(r => r.roster_id === selectedRosterId) 
    : rosters[0];
  
  // Get utilization data for the selected roster
  const utilizationData = selectedRoster 
    ? getUtilizationData(selectedRoster.roster_id) 
    : {};
  
  // Get owner of the selected roster
  const selectedOwner = selectedRoster 
    ? getTeamOwner(selectedRoster.roster_id, rosters, users) 
    : null;

  return (
    <div className="bg-white dark:bg-dark-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Roster Utilization Heatmap</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          See how efficiently each team utilizes their roster spots
        </p>
      </div>
      
      <div className="border-t border-gray-200 dark:border-dark-700 px-4 py-5 sm:px-6">
        <div className="mb-4">
          <label htmlFor="roster-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Team
          </label>
          <select
            id="roster-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedRosterId || ''}
            onChange={(e) => setSelectedRosterId(parseInt(e.target.value) || null)}
          >
            <option value="">Select a team...</option>
            {rosters.map((roster) => {
              const owner = getTeamOwner(roster.roster_id, rosters, users);
              return (
                <option key={roster.roster_id} value={roster.roster_id}>
                  {owner?.metadata?.team_name || owner?.display_name || `Team ${roster.roster_id}`}
                </option>
              );
            })}
          </select>
        </div>
        
        {selectedRoster && (
          <div>
            <h4 className="text-lg font-semibold mb-2 text-dark-900 dark:text-white">
              {selectedOwner?.metadata?.team_name || selectedOwner?.display_name || `Team ${selectedRoster.roster_id}`}
            </h4>
            
            <div className="grid grid-cols-5 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {Object.entries(utilizationData).map(([position, data]) => {
                const percentage = calculateUtilizationPercentage(data.optimalCount, data.totalWeeks);
                const heatmapClass = getHeatmapClass(percentage);
                
                return (
                  <div key={position} className={`flex flex-col items-center p-4 rounded-lg ${heatmapClass}`}>
                    <span className="text-sm font-semibold text-white">{position}</span>
                    <span className="text-lg font-bold text-white">{percentage.toFixed(0)}%</span>
                    <span className="text-xs text-white">{data.optimalCount}/{data.totalWeeks}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-4 items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low</span>
                <div className="flex">
                  <div className="w-8 h-6 bg-red-400"></div>
                  <div className="w-8 h-6 bg-orange-400"></div>
                  <div className="w-8 h-6 bg-yellow-400"></div>
                  <div className="w-8 h-6 bg-green-400"></div>
                  <div className="w-8 h-6 bg-green-500"></div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RosterHeatmap; 