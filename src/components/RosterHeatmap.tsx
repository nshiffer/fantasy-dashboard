'use client';

import React, { useState, useMemo } from 'react';
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

  // Get starters and bench players for the selected roster
  const { starters, benchPlayers } = useMemo(() => {
    if (!selectedRoster || !players) return { starters: [], benchPlayers: [] };
    
    // Get the most recent matchup for starter information
    let recentMatchup: Matchup | null = null;
    for (let week = currentWeek; week >= 1; week--) {
      const weekMatchups = matchups[week] || [];
      const matchup = weekMatchups.find(m => m.roster_id === selectedRoster.roster_id);
      if (matchup) {
        recentMatchup = matchup;
        break;
      }
    }
    
    const starterIds = recentMatchup?.starters || selectedRoster.starters || [];
    const allPlayerIds = selectedRoster.players || [];
    
    // Filter bench players (players on roster but not in starters)
    const benchIds = allPlayerIds.filter(id => !starterIds.includes(id));
    
    // Hard-coded position slot order based on standard fantasy football lineup
    // This is a fallback if we can't determine the actual league settings
    const standardPositionSlots = [
      'QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'DEF', 'FLEX' 
    ];
    
    // First, let's get player information to decide positions
    const playerInfos = starterIds.map(id => {
      const player = players[id] || { position: 'Unknown' };
      return {
        id,
        playerPosition: player.position || 'Unknown',
        name: player ? `${player.first_name} ${player.last_name}` : 'Unknown Player',
        team: player?.team || 'FA'
      };
    });
    
    // Now determine the slot assignments based on player positions
    const positionAssignments: string[] = [];
    const usedPositions = new Set<string>();
    const positionCounts: Record<string, number> = { 'QB': 0, 'RB': 0, 'WR': 0, 'TE': 0, 'DEF': 0, 'K': 0 };
    
    // First pass - assign standard positions (QB, RB, WR, TE, DEF, K)
    playerInfos.forEach(player => {
      if (player.playerPosition) {
        positionCounts[player.playerPosition] = (positionCounts[player.playerPosition] || 0) + 1;
      }
    });
    
    // Second pass - actually assign positions based on typical lineup rules
    // Standard positions first (1 QB, 2 RB, 2 WR, 1 TE)
    const standardPositions = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE'];
    
    // Assign standard positions first
    playerInfos.forEach((player, index) => {
      // Skip DEF positions as those are usually not players
      if (player.playerPosition === 'DEF') {
        positionAssignments[index] = 'DEF';
        usedPositions.add(`${player.playerPosition}-${index}`);
        return;
      }
      
      // For standard lineup positions
      if (standardPositions.includes(player.playerPosition) && 
          !usedPositions.has(player.playerPosition) &&
          index < standardPositions.length) {
        // Count how many of this position we've already assigned
        const positionCount = Array.from(usedPositions)
          .filter(p => p.startsWith(player.playerPosition + '-')).length;
          
        // Check if we still need this position
        if (positionCount < (player.playerPosition === 'RB' || player.playerPosition === 'WR' ? 2 : 1)) {
          positionAssignments[index] = player.playerPosition;
          usedPositions.add(`${player.playerPosition}-${index}`);
          return;
        }
      }
      
      // Assign flex positions after
      positionAssignments[index] = player.playerPosition === 'QB' ? 'SUPERFLEX' : 'FLEX';
    });
    
    // Convert to starter objects with correct position slots
    const starterObjs = playerInfos.map((info, index) => {
      const player = players[info.id];
      
      // Allow override of position assignments with standard mapping if available
      const slot = positionAssignments[index] || 
                  (index < standardPositionSlots.length ? standardPositionSlots[index] : 'FLEX');
                  
      // For display purposes, handle QB in flex as SUPERFLEX
      const displaySlot = info.playerPosition === 'QB' && slot === 'FLEX' ? 'SUPERFLEX' : slot;
      
      return {
        id: info.id,
        name: info.name,
        position: info.playerPosition,
        team: info.team,
        slot: info.playerPosition === 'QB' && slot === 'FLEX' ? 'SUPERFLEX' : slot, // For data purposes
        displaySlot: displaySlot, // For UI display
        originalPosition: info.playerPosition
      };
    });
    
    const benchObjs = benchIds.map(id => {
      const player = players[id];
      return {
        id,
        name: player ? `${player.first_name} ${player.last_name}` : 'Unknown Player',
        position: player?.position || 'Unknown',
        team: player?.team || 'FA'
      };
    });
    
    return { 
      starters: starterObjs, 
      benchPlayers: benchObjs.sort((a, b) => {
        // Sort by position in order QB, RB, WR, TE, K, DEF
        const posOrder: Record<string, number> = { 'QB': 1, 'RB': 2, 'WR': 3, 'TE': 4, 'K': 5, 'DEF': 6 };
        return (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
      }) 
    };
  }, [selectedRoster, players, currentWeek, matchups, rosterPositions]);

  // Calculate roster needs
  const rosterNeeds = useMemo(() => {
    if (!selectedRoster || !players) return {};
    
    // Count players by position
    const positionCounts: Record<string, number> = {};
    
    // Get valid positions from the league (use roster positions to determine valid positions)
    // We need to look at actual player positions that are in use, not just roster slots
    const playerPositions = new Set<string>();
    selectedRoster.players.forEach(playerId => {
      const player = players[playerId];
      if (player && player.position) {
        playerPositions.add(player.position);
      }
    });
    
    // Combine with roster positions to ensure we cover everything
    const basePositions = rosterPositions.map(pos => {
      // Strip out numbers and special designations to get base position
      return pos.replace(/[0-9]/g, '').split('_')[0];
    }).filter(pos => !['FLEX', 'SUPER', 'REC'].includes(pos));
    
    // The final valid positions are the intersection of positions found in the roster
    // and positions that actual players on the team have
    const validPositions = [...new Set([...basePositions, ...playerPositions])].filter(pos => 
      // Make sure it's a real position - sometimes positions like "DST" can appear in the UI
      // but aren't actual player positions
      ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(pos)
    );
    
    // Initialize counts for each valid position
    validPositions.forEach(pos => {
      positionCounts[pos] = 0;
    });
    
    // Count player positions on roster
    selectedRoster.players.forEach(playerId => {
      const player = players[playerId];
      if (player && validPositions.includes(player.position)) {
        positionCounts[player.position]++;
      }
    });
    
    // Determine ideal counts based on roster structure and league settings
    const idealCounts: Record<string, number> = {};
    
    // Count how many of each position are in the starting lineup
    const positionSlots: Record<string, number> = {};
    rosterPositions.forEach(pos => {
      const basePosition = pos.replace(/[0-9]/g, '').split('_')[0];
      if (validPositions.includes(basePosition)) {
        positionSlots[basePosition] = (positionSlots[basePosition] || 0) + 1;
      }
    });
    
    // Set ideal counts based on starting requirements plus depth
    validPositions.forEach(pos => {
      const startingSlots = positionSlots[pos] || 0;
      // QB and TE typically need 1-2 backup, RB and WR need more
      const backups = pos === 'QB' || pos === 'TE' || pos === 'K' || pos === 'DEF' ? 1 : 2;
      idealCounts[pos] = startingSlots + backups;
    });
    
    // Calculate needs
    const needs: Record<string, { current: number, ideal: number, status: 'surplus' | 'balanced' | 'need', diff: number }> = {};
    
    Object.keys(positionCounts).forEach(pos => {
      const current = positionCounts[pos];
      const ideal = idealCounts[pos] || 0;
      const diff = current - ideal;
      
      let status: 'surplus' | 'balanced' | 'need' = 'balanced';
      if (diff < 0) status = 'need';
      else if (diff > 1) status = 'surplus';
      
      needs[pos] = { current, ideal, status, diff };
    });
    
    return needs;
  }, [selectedRoster, players, rosterPositions]);

  // Calculate flex position usage across the league
  const flexStats = useMemo(() => {
    if (!matchups || !rosters || !players || !selectedRoster) 
      return { flex: {}, superflex: {} };
    
    // Find flex slot positions in the roster
    const flexPositionIndices: number[] = [];
    const superflexPositionIndices: number[] = [];
    
    rosterPositions.forEach((position, index) => {
      if (position === 'FLEX') {
        flexPositionIndices.push(index);
      } else if (position === 'SUPER_FLEX' || position === 'SUPERFLEX') {
        superflexPositionIndices.push(index);
      }
    });
    
    // If no flex positions exist in this league, return empty stats
    if (flexPositionIndices.length === 0 && superflexPositionIndices.length === 0) {
      return { flex: {}, superflex: {} };
    }
    
    // Count how many teams start each position type in flex spots
    const flexPositionCounts: Record<string, number> = {};
    const superflexPositionCounts: Record<string, number> = {};
    let totalFlexSlots = 0;
    let totalSuperflexSlots = 0;
    
    // First try to use historical matchup data if available
    let hasMatchupData = false;
    
    // Process each team's most recent starters from matchups
    rosters.forEach(roster => {
      // Get the most recent matchup
      let recentMatchup: Matchup | null = null;
      for (let week = currentWeek; week >= 1; week--) {
        const weekMatchups = matchups[week] || [];
        const matchup = weekMatchups.find(m => m.roster_id === roster.roster_id);
        if (matchup && matchup.starters && matchup.starters.length > 0) {
          recentMatchup = matchup;
          hasMatchupData = true;
          break;
        }
      }
      
      if (!recentMatchup || !recentMatchup.starters) return;
      
      // Check each flex position in the lineup
      flexPositionIndices.forEach(index => {
        if (index >= recentMatchup!.starters.length) return;
        
        const playerId = recentMatchup!.starters[index];
        const player = players[playerId];
        
        if (!player) return;
        
        totalFlexSlots++;
        const position = player.position;
        flexPositionCounts[position] = (flexPositionCounts[position] || 0) + 1;
      });
      
      // Check each superflex position in the lineup
      superflexPositionIndices.forEach(index => {
        if (index >= recentMatchup!.starters.length) return;
        
        const playerId = recentMatchup!.starters[index];
        const player = players[playerId];
        
        if (!player) return;
        
        totalSuperflexSlots++;
        const position = player.position;
        superflexPositionCounts[position] = (superflexPositionCounts[position] || 0) + 1;
      });
    });
    
    // If we don't have matchup data, use current starters instead
    if (!hasMatchupData) {
      // For each roster, check their current starters
      rosters.forEach(roster => {
        // Skip if no starters
        if (!roster.starters || roster.starters.length === 0) return;
        
        // Check each flex position in the lineup
        flexPositionIndices.forEach(index => {
          if (index >= roster.starters.length) return;
          
          const playerId = roster.starters[index];
          const player = players[playerId];
          
          if (!player) return;
          
          totalFlexSlots++;
          const position = player.position;
          flexPositionCounts[position] = (flexPositionCounts[position] || 0) + 1;
        });
        
        // Check each superflex position in the lineup
        superflexPositionIndices.forEach(index => {
          if (index >= roster.starters.length) return;
          
          const playerId = roster.starters[index];
          const player = players[playerId];
          
          if (!player) return;
          
          totalSuperflexSlots++;
          const position = player.position;
          superflexPositionCounts[position] = (superflexPositionCounts[position] || 0) + 1;
        });
      });
    }

    // If we still don't have any flex data, we can at least analyze the selected team's flex usage
    if (totalFlexSlots === 0 && flexPositionIndices.length > 0) {
      if (starters.length > 0) {
        flexPositionIndices.forEach(index => {
          if (index >= starters.length) return;
          
          const player = starters[index];
          if (!player || !player.originalPosition) return;
          
          totalFlexSlots++;
          const position = player.originalPosition;
          flexPositionCounts[position] = (flexPositionCounts[position] || 0) + 1;
        });
      }
    }
    
    // If we still don't have any superflex data, we can at least analyze the selected team's superflex usage
    if (totalSuperflexSlots === 0 && superflexPositionIndices.length > 0) {
      if (starters.length > 0) {
        superflexPositionIndices.forEach(index => {
          if (index >= starters.length) return;
          
          const player = starters[index];
          if (!player || !player.originalPosition) return;
          
          totalSuperflexSlots++;
          const position = player.originalPosition;
          superflexPositionCounts[position] = (superflexPositionCounts[position] || 0) + 1;
        });
      }
    }
    
    // Calculate percentages
    const flexStats: Record<string, number> = {};
    const superflexStats: Record<string, number> = {};
    
    if (totalFlexSlots > 0) {
      Object.entries(flexPositionCounts).forEach(([position, count]) => {
        flexStats[position] = Math.round((count / totalFlexSlots) * 100);
      });
    }
    
    if (totalSuperflexSlots > 0) {
      Object.entries(superflexPositionCounts).forEach(([position, count]) => {
        superflexStats[position] = Math.round((count / totalSuperflexSlots) * 100);
      });
    }
    
    return { 
      flex: flexStats, 
      superflex: superflexStats,
      hasFlex: totalFlexSlots > 0,
      hasSuperflex: totalSuperflexSlots > 0
    };
  }, [matchups, rosters, players, currentWeek, rosterPositions, selectedRoster, starters]);

  // Find out what positions the selected team is using in flex spots
  const selectedTeamFlexUsage = useMemo(() => {
    if (!selectedRoster || !players || starters.length === 0) return {};
    
    const result: Record<string, string> = {};
    
    starters.forEach(player => {
      // If this player is in a FLEX spot or SUPERFLEX spot
      if (player.slot === 'FLEX' || player.slot === 'SUPERFLEX') {
        result[player.slot] = player.originalPosition;
      }
    });
    
    return result;
  }, [selectedRoster, players, starters]);

  return (
    <div className="bg-white dark:bg-dark-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Roster Analysis</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Analyze roster strengths and weaknesses
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
            <h4 className="text-lg font-semibold mb-4 text-dark-900 dark:text-white">
              {selectedOwner?.metadata?.team_name || selectedOwner?.display_name || `Team ${selectedRoster.roster_id}`}
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Current Roster Section */}
              <div className="bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
                <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b border-gray-200 dark:border-dark-600">
                  <h5 className="font-medium text-gray-900 dark:text-white">Current Roster</h5>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-dark-600">
                  {/* Starters */}
                  <div className="p-4">
                    <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Starters</h6>
                    <div className="space-y-2">
                      {starters.map((player, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-24 text-xs text-center font-medium rounded py-1 ${
                              player.slot === 'FLEX' || player.slot === 'SUPERFLEX' ? 
                                'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 
                                'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300'
                            }`}>
                              {player.displaySlot || player.slot}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{player.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{player.team} - {player.originalPosition}</div>
                            </div>
                          </div>
                          
                          {/* Show flex usage comparison when this is a flex position */}
                          {(player.slot === 'FLEX' || player.slot === 'SUPERFLEX') && flexStats.flex && 
                           typeof flexStats.flex === 'object' && 
                           player.originalPosition in (flexStats.flex as Record<string, number>) && (
                            <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                              {(flexStats.flex as Record<string, number>)[player.originalPosition]}% of teams start {player.originalPosition} in {player.slot === 'SUPERFLEX' ? 'SUPERFLEX' : 'FLEX'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Bench Players */}
                  <div className="p-4">
                    <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Bench ({benchPlayers.length})</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {benchPlayers.map((player, idx) => (
                        <div key={idx} className="flex items-center space-x-2 bg-gray-50 dark:bg-dark-800 p-2 rounded">
                          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-dark-700 text-xs font-medium text-gray-800 dark:text-gray-300">
                            {player.position}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{player.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{player.team}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Roster Analysis Section */}
              <div className="space-y-4">
                {/* Roster Needs */}
                <div className="bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b border-gray-200 dark:border-dark-600">
                    <h5 className="font-medium text-gray-900 dark:text-white">Roster Needs</h5>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {Object.entries(rosterNeeds).map(([position, data]) => (
                        <div key={position} className={`rounded-lg p-3 ${
                          data.status === 'need' 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40' 
                            : data.status === 'surplus' 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/40'
                              : 'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-dark-600'
                        } border flex flex-col items-center justify-center`}>
                          <div className="text-sm font-semibold mb-1">{position}</div>
                          <div className="text-xl font-bold">{data.current}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {data.status === 'need' 
                              ? `Need ${Math.abs(data.diff)} more` 
                              : data.status === 'surplus' 
                                ? `${data.diff} extra` 
                                : 'Balanced'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Flex Position Analysis */}
                <div className="bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b border-gray-200 dark:border-dark-600">
                    <h5 className="font-medium text-gray-900 dark:text-white">League Flex Position Trends</h5>
                  </div>
                  <div className="p-4">
                    {(flexStats.hasFlex || flexStats.hasSuperflex) ? (
                      <div className="space-y-4">
                        {/* Regular FLEX */}
                        {flexStats.hasFlex && flexStats.flex && Object.keys(flexStats.flex).length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium mb-2">FLEX Position Usage</h6>
                            <div className="flex items-center mb-1">
                              {flexStats.flex && Object.entries(flexStats.flex as Record<string, number>).sort(([, a], [, b]) => b - a).map(([position, percentage]) => (
                                <div 
                                  key={position}
                                  className="h-8" 
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: position === 'RB' ? '#ef4444' : position === 'WR' ? '#3b82f6' : '#8b5cf6'
                                  }}
                                >
                                  <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                                    {percentage > 10 ? `${position} ${percentage}%` : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              {flexStats.flex && Object.entries(flexStats.flex as Record<string, number>).sort(([, a], [, b]) => b - a).map(([position, percentage]) => (
                                <div key={position}>
                                  <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ 
                                    backgroundColor: position === 'RB' ? '#ef4444' : position === 'WR' ? '#3b82f6' : '#8b5cf6'
                                  }}></span>
                                  {position}: {percentage}%
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* SUPERFLEX */}
                        {flexStats.hasSuperflex && flexStats.superflex && Object.keys(flexStats.superflex).length > 0 && (
                          <div className="pt-3 border-t border-gray-200 dark:border-dark-600">
                            <h6 className="text-sm font-medium mb-2">SUPERFLEX Position Usage</h6>
                            <div className="flex items-center mb-1">
                              {flexStats.superflex && Object.entries(flexStats.superflex as Record<string, number>).sort(([, a], [, b]) => b - a).map(([position, percentage]) => (
                                <div 
                                  key={position}
                                  className="h-8" 
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: position === 'QB' ? '#10b981' : position === 'RB' ? '#ef4444' : position === 'WR' ? '#3b82f6' : '#8b5cf6'
                                  }}
                                >
                                  <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                                    {percentage > 10 ? `${position} ${percentage}%` : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              {flexStats.superflex && Object.entries(flexStats.superflex as Record<string, number>).sort(([, a], [, b]) => b - a).map(([position, percentage]) => (
                                <div key={position}>
                                  <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ 
                                    backgroundColor: position === 'QB' ? '#10b981' : position === 'RB' ? '#ef4444' : position === 'WR' ? '#3b82f6' : '#8b5cf6'
                                  }}></span>
                                  {position}: {percentage}%
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Your Team's Flex Usage */}
                        {Object.keys(selectedTeamFlexUsage).length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 mt-3">
                            <h6 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Your Flex Usage</h6>
                            <ul className="space-y-1 text-sm">
                              {Object.entries(selectedTeamFlexUsage).map(([slot, position]) => (
                                <li key={slot} className="flex items-center">
                                  <span className="font-medium">{slot === 'SUPERFLEX' ? 'SUPERFLEX' : slot}:</span> 
                                  <span className="ml-2">{position}</span>
                                  {flexStats.flex && typeof flexStats.flex === 'object' && position in (flexStats.flex as Record<string, number>) && slot === 'FLEX' && (
                                    <span className="ml-2 text-xs">
                                      (League avg: {(flexStats.flex as Record<string, number>)[position]}% use {position})
                                    </span>
                                  )}
                                  {flexStats.superflex && typeof flexStats.superflex === 'object' && position in (flexStats.superflex as Record<string, number>) && slot === 'SUPERFLEX' && (
                                    <span className="ml-2 text-xs">
                                      (League avg: {(flexStats.superflex as Record<string, number>)[position]}% use {position})
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {rosterPositions.some(pos => pos.includes('FLEX')) ? 
                          'Not enough data yet - will show flex position usage as the season progresses' : 
                          'This league does not use flex positions'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Roster Utilization Heatmap - Original Component */}
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-4">Roster Utilization Heatmap</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                See how efficiently each team utilizes their roster spots
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default RosterHeatmap; 