import axios from 'axios';
import { League, User, Roster, Matchup, Player, TrendingPlayer } from '../types/sleeper';

const BASE_URL = 'https://api.sleeper.app/v1';

export const fetchUser = async (username: string): Promise<User> => {
  const response = await axios.get(`${BASE_URL}/user/${username}`);
  return response.data;
};

export const fetchLeague = async (leagueId: string): Promise<League> => {
  const response = await axios.get(`${BASE_URL}/league/${leagueId}`);
  return response.data;
};

export const fetchRosters = async (leagueId: string): Promise<Roster[]> => {
  const response = await axios.get(`${BASE_URL}/league/${leagueId}/rosters`);
  return response.data;
};

export const fetchUsers = async (leagueId: string): Promise<User[]> => {
  const response = await axios.get(`${BASE_URL}/league/${leagueId}/users`);
  return response.data;
};

export const fetchMatchups = async (leagueId: string, week: number): Promise<Matchup[]> => {
  const response = await axios.get(`${BASE_URL}/league/${leagueId}/matchups/${week}`);
  return response.data;
};

export const fetchAllPlayers = async (): Promise<{ [key: string]: Player }> => {
  const response = await axios.get(`${BASE_URL}/players/nfl`);
  return response.data;
};

export const fetchTrendingPlayers = async (
  type: 'add' | 'drop',
  lookbackHours: number = 24,
  limit: number = 25
): Promise<TrendingPlayer[]> => {
  const response = await axios.get(
    `${BASE_URL}/players/nfl/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`
  );
  return response.data;
};

export const fetchUserLeagues = async (userId: string, season: string): Promise<League[]> => {
  const response = await axios.get(`${BASE_URL}/user/${userId}/leagues/nfl/${season}`);
  return response.data;
};

// Fetch league drafts
export const fetchLeagueDrafts = async (leagueId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}/drafts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching league drafts:", error);
    return [];
  }
};

// Fetch draft picks
export const fetchDraftPicks = async (draftId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/draft/${draftId}/picks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching draft picks:", error);
    return [];
  }
};

// Fetch traded picks
export const fetchTradedPicks = async (draftId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/draft/${draftId}/traded_picks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching traded picks:", error);
    return [];
  }
};

// Fetch specific draft
export const fetchDraft = async (draftId: string): Promise<any> => {
  try {
    const response = await axios.get(`${BASE_URL}/draft/${draftId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching draft:", error);
    return null;
  }
};

// Helper function to get player name from player ID
export const getPlayerName = (playerId: string, players: { [key: string]: Player }): string => {
  const player = players[playerId];
  return player ? `${player.first_name} ${player.last_name}` : 'Unknown Player';
};

// Helper function to get team owner from roster ID
export const getTeamOwner = (rosterId: number, rosters: Roster[], users: User[]): User | undefined => {
  const roster = rosters.find(r => r.roster_id === rosterId);
  if (!roster) return undefined;
  
  return users.find(u => u.user_id === roster.owner_id);
}; 