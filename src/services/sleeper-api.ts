import { League, User, Roster, Matchup, Player, TrendingPlayer } from '../types/sleeper';

const BASE_URL = 'https://api.sleeper.app/v1';

interface NflState {
  season: string;
  season_type: string;
  week: number;
}

const request = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Sleeper request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const fetchUser = async (username: string): Promise<User> =>
  request<User>(`/user/${encodeURIComponent(username)}`);

export const fetchLeague = async (leagueId: string): Promise<League> =>
  request<League>(`/league/${encodeURIComponent(leagueId)}`);

export const fetchRosters = async (leagueId: string): Promise<Roster[]> =>
  request<Roster[]>(`/league/${encodeURIComponent(leagueId)}/rosters`);

export const fetchUsers = async (leagueId: string): Promise<User[]> =>
  request<User[]>(`/league/${encodeURIComponent(leagueId)}/users`);

export const fetchMatchups = async (leagueId: string, week: number): Promise<Matchup[]> =>
  request<Matchup[]>(`/league/${encodeURIComponent(leagueId)}/matchups/${week}`);

export const fetchAllPlayers = async (): Promise<Record<string, Player>> =>
  request<Record<string, Player>>('/players/nfl');

export const fetchNflState = async (): Promise<NflState> =>
  request<NflState>('/state/nfl');

export const fetchTrendingPlayers = async (
  type: 'add' | 'drop',
  lookbackHours: number = 24,
  limit: number = 25
): Promise<TrendingPlayer[]> =>
  request<TrendingPlayer[]>(`/players/nfl/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`);

export const fetchUserLeagues = async (userId: string, season: string): Promise<League[]> =>
  request<League[]>(`/user/${encodeURIComponent(userId)}/leagues/nfl/${encodeURIComponent(season)}`);

export const fetchLeagueDrafts = async (leagueId: string): Promise<any[]> => {
  try {
    return await request<any[]>(`/league/${encodeURIComponent(leagueId)}/drafts`);
  } catch (error) {
    console.error("Error fetching league drafts:", error);
    return [];
  }
};

export const fetchDraftPicks = async (draftId: string): Promise<any[]> => {
  try {
    return await request<any[]>(`/draft/${encodeURIComponent(draftId)}/picks`);
  } catch (error) {
    console.error("Error fetching draft picks:", error);
    return [];
  }
};

export const fetchTradedPicks = async (draftId: string): Promise<any[]> => {
  try {
    return await request<any[]>(`/draft/${encodeURIComponent(draftId)}/traded_picks`);
  } catch (error) {
    console.error("Error fetching traded picks:", error);
    return [];
  }
};

export const fetchDraft = async (draftId: string): Promise<any> => {
  try {
    return await request<any>(`/draft/${encodeURIComponent(draftId)}`);
  } catch (error) {
    console.error("Error fetching draft:", error);
    return null;
  }
};

export const getPlayerName = (playerId: string, players: Record<string, Player>): string => {
  const player = players[playerId];
  return player ? `${player.first_name} ${player.last_name}` : 'Unknown Player';
};

export const getTeamOwner = (rosterId: number, rosters: Roster[], users: User[]): User | undefined => {
  const roster = rosters.find((candidate) => candidate.roster_id === rosterId);
  return roster ? users.find((user) => user.user_id === roster.owner_id) : undefined;
};
