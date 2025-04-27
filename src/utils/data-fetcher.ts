import fs from 'fs/promises';
import path from 'path';
import {
  fetchLeague,
  fetchRosters,
  fetchUsers,
  fetchMatchups,
  fetchAllPlayers,
} from '../services/sleeper-api';
import { calculateStandings, calculateStreak } from './standings';
import { League, User, Roster, Matchup, Player, LeagueData, Standing } from '../types/sleeper';

export interface FetchConfig {
  leagueId: string;
  season: string;
  weeksToFetch: number[];
}

export const fetchLeagueData = async (config: FetchConfig): Promise<LeagueData> => {
  console.log(`Fetching data for league ${config.leagueId} in season ${config.season}...`);
  
  const league = await fetchLeague(config.leagueId);
  const users = await fetchUsers(config.leagueId);
  const rosters = await fetchRosters(config.leagueId);
  const players = await fetchAllPlayers();
  
  // Initialize standings
  const standings = calculateStandings(rosters, users);
  
  // Fetch matchups for each week
  const matchups: { [week: number]: Matchup[] } = {};
  
  for (const week of config.weeksToFetch) {
    try {
      matchups[week] = await fetchMatchups(config.leagueId, week);
    } catch (error) {
      console.error(`Failed to fetch matchups for week ${week}:`, error);
      matchups[week] = [];
    }
  }
  
  // Calculate streaks
  const currentWeek = Math.max(...config.weeksToFetch);
  for (const standing of standings) {
    const roster = rosters.find(r => r.owner_id === standing.user_id);
    if (roster) {
      standing.streak = calculateStreak(roster.roster_id, matchups, currentWeek);
    }
  }
  
  return {
    league,
    users,
    rosters,
    players,
    standings,
    matchups,
  };
};

export const saveLeagueData = async (data: LeagueData, outputDir: string = 'data'): Promise<void> => {
  console.log('Saving league data...');
  
  // Create output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });
  
  // Save league data
  await fs.writeFile(
    path.join(outputDir, 'league.json'),
    JSON.stringify(data.league, null, 2)
  );
  
  // Save users
  await fs.writeFile(
    path.join(outputDir, 'users.json'),
    JSON.stringify(data.users, null, 2)
  );
  
  // Save rosters
  await fs.writeFile(
    path.join(outputDir, 'rosters.json'),
    JSON.stringify(data.rosters, null, 2)
  );
  
  // Save matchups
  await fs.writeFile(
    path.join(outputDir, 'matchups.json'),
    JSON.stringify(data.matchups, null, 2)
  );
  
  // Save standings
  await fs.writeFile(
    path.join(outputDir, 'standings.json'),
    JSON.stringify(data.standings, null, 2)
  );
  
  // Save players (this is a large file)
  await fs.writeFile(
    path.join(outputDir, 'players.json'),
    JSON.stringify(data.players, null, 2)
  );
  
  // Save a consolidated data file for quick access
  const consolidatedData = {
    league: data.league,
    users: data.users,
    standings: data.standings,
    currentWeek: Math.max(...Object.keys(data.matchups).map(Number)),
  };
  
  await fs.writeFile(
    path.join(outputDir, 'data.json'),
    JSON.stringify(consolidatedData, null, 2)
  );
  
  console.log('Data saved successfully!');
};

export const fetchAndSaveLeagueData = async (config: FetchConfig): Promise<void> => {
  try {
    const data = await fetchLeagueData(config);
    await saveLeagueData(data);
  } catch (error) {
    console.error('Failed to fetch and save league data:', error);
    throw error;
  }
}; 