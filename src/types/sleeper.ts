export interface User {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  metadata?: {
    team_name?: string;
  };
  is_owner?: boolean;
}

export interface League {
  total_rosters: number;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  sport: string;
  settings: any;
  season_type: string;
  season: string;
  scoring_settings: any;
  roster_positions: string[];
  previous_league_id: string;
  name: string;
  league_id: string;
  draft_id: string;
  avatar: string;
}

export interface Roster {
  starters: string[];
  settings: {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    losses: number;
    fpts_decimal: number;
    fpts_against_decimal: number;
    fpts_against: number;
    fpts: number;
  };
  roster_id: number;
  reserve: string[];
  players: string[];
  owner_id: string;
  league_id: string;
  roster_positions?: string[];
}

export interface Matchup {
  starters: string[];
  roster_id: number;
  players: string[];
  matchup_id: number;
  points: number;
}

export interface Player {
  hashtag: string;
  depth_chart_position?: number;
  status: string;
  sport: string;
  fantasy_positions: string[];
  number: number;
  search_last_name: string;
  injury_start_date: string | null;
  weight: string;
  position: string;
  practice_participation: string | null;
  team: string;
  last_name: string;
  college: string;
  injury_status: string | null;
  player_id: string;
  height: string;
  search_full_name: string;
  age: number;
  birth_country: string;
  search_rank: number;
  first_name: string;
  depth_chart_order?: number;
  years_exp: number;
  search_first_name: string;
}

export interface TrendingPlayer {
  player_id: string;
  count: number;
}

export interface Standing {
  user_id: string;
  username: string;
  team_name?: string;
  avatar: string;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
  streak: number;
  rank: number;
}

export interface LeagueData {
  league: League;
  users: User[];
  rosters: Roster[];
  players: { [playerId: string]: Player };
  standings: Standing[];
  matchups: { [week: number]: Matchup[] };
}

export interface Draft {
  type: string;
  status: 'complete' | 'drafting' | 'paused' | 'not_started';
  start_time: number;
  sport: string;
  settings: {
    rounds: number;
    pick_timer: number;
    player_type: number;
    nomination_timer: number;
    cpu_autopick: boolean;
    alpha_sort: boolean;
    slots_wr: number;
    slots_te: number;
    slots_rb: number;
    slots_qb: number;
    slots_flex: number;
    slots_bn: number;
    reserve_rounds: number;
    reversal_round: number;
    nomination_total: number;
    trade_deadline: number;
    league_id: string;
    budget: number;
    [key: string]: any;
  };
  season_type: string;
  season: string;
  metadata: any;
  league_id: string;
  last_picked: number;
  last_message_time: number;
  last_message_id: string;
  draft_order: { [key: string]: number };
  draft_id: string;
  creators: string[];
  created: number;
  slot_to_roster_id: { [key: string]: number };
}

export interface DraftPick {
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  pick_no: number;
  metadata: any;
  is_keeper: boolean;
  draft_slot: number;
  draft_id: string;
}

export interface TradedPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
  league_id: string;
}

export interface SleeperDraftPick {
  round: number;
  roster_id: number;
  original_roster_id: number;
  position?: number; // Draft slot position
  player_id?: string;
  is_traded?: boolean;
  pick_no: number;
} 