import { Roster, User, Standing, Matchup } from '../types/sleeper';

export const calculateStandings = (rosters: Roster[], users: User[]): Standing[] => {
  const standings: Standing[] = rosters.map(roster => {
    const user = users.find(u => u.user_id === roster.owner_id);
    
    if (!user) {
      throw new Error(`User not found for roster ${roster.roster_id}`);
    }
    
    // Ensure we have a valid team name by using fallbacks
    const teamName = user.metadata?.team_name || user.display_name || user.username || `Team ${roster.roster_id}`;
    
    return {
      user_id: user.user_id,
      username: user.username,
      team_name: teamName,
      avatar: user.avatar,
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      ties: roster.settings.ties,
      points_for: roster.settings.fpts + roster.settings.fpts_decimal / 100,
      points_against: roster.settings.fpts_against + roster.settings.fpts_against_decimal / 100,
      streak: 0, // Calculated below
      rank: 0, // Calculated below
    };
  });

  // Sort by win percentage, then by points for
  return standings
    .sort((a, b) => {
      const aWinPct = a.wins / (a.wins + a.losses + a.ties);
      const bWinPct = b.wins / (b.wins + b.losses + b.ties);
      
      if (bWinPct !== aWinPct) {
        return bWinPct - aWinPct;
      }
      
      return b.points_for - a.points_for;
    })
    .map((standing, index) => ({ ...standing, rank: index + 1 }));
};

export const calculateStreak = (
  rosterId: number,
  matchups: { [week: number]: Matchup[] },
  currentWeek: number
): number => {
  let streak = 0;
  let won = false;
  
  // Start from the current week and go backwards
  for (let week = currentWeek; week >= 1; week--) {
    const weekMatchups = matchups[week];
    if (!weekMatchups) continue;
    
    const teamMatchup = weekMatchups.find(m => m.roster_id === rosterId);
    if (!teamMatchup) continue;
    
    // Find opponent
    const opponentMatchup = weekMatchups.find(m => 
      m.matchup_id === teamMatchup.matchup_id && m.roster_id !== rosterId
    );
    
    if (!opponentMatchup) continue;
    
    const didWin = teamMatchup.points > opponentMatchup.points;
    const didTie = teamMatchup.points === opponentMatchup.points;
    
    // First iteration sets initial streak status
    if (streak === 0) {
      won = didWin;
      
      if (!didTie) {
        streak = 1;
      }
      continue;
    }
    
    // If the result matches the streak direction, increment
    if ((won && didWin) || (!won && !didWin && !didTie)) {
      streak++;
    } else {
      // Streak is broken
      break;
    }
  }
  
  // Return positive number for win streak, negative for loss streak
  return won ? streak : -streak;
};

export const calculateWeeklyScores = (
  rosterId: number,
  matchups: { [week: number]: Matchup[] }
): number[] => {
  const weeklyScores: number[] = [];
  
  for (let week = 1; week <= Object.keys(matchups).length; week++) {
    const weekMatchups = matchups[week];
    if (!weekMatchups) {
      weeklyScores.push(0);
      continue;
    }
    
    const teamMatchup = weekMatchups.find(m => m.roster_id === rosterId);
    if (!teamMatchup) {
      weeklyScores.push(0);
      continue;
    }
    
    weeklyScores.push(teamMatchup.points);
  }
  
  return weeklyScores;
};

export const isOnHotStreak = (weeklyScores: number[], threshold: number = 30): boolean => {
  // Check if the player has scored more than the threshold in the last two weeks
  if (weeklyScores.length < 2) return false;
  
  const lastTwoWeeks = weeklyScores.slice(-2);
  return lastTwoWeeks.every(score => score >= threshold);
};

export const detectUpset = (winnerRank: number, loserRank: number): boolean => {
  // If a team with a worse rank (higher number) beats a team with a better rank
  return winnerRank > loserRank;
};

export const calculatePowerRankings = (
  standings: Standing[],
  matchups: { [week: number]: Matchup[] },
  currentWeek: number
): Standing[] => {
  // Clone the standings to avoid modifying the original
  const powerRankings = JSON.parse(JSON.stringify(standings)) as Standing[];
  
  /**
   * Power Rankings Algorithm
   * 
   * This algorithm calculates a power score for each team based on three key factors:
   * 
   * 1. Win Percentage (50% weight): Traditional win-loss record
   *    - Win % is calculated as: wins / (wins + losses + ties)
   *    - Higher win percentages indicate stronger teams
   *    - This factor carries the most weight as winning games is still the primary goal
   * 
   * 2. Points For (30% weight): Season-long scoring performance
   *    - Total points scored throughout the season
   *    - Normalized against the highest-scoring team in the league
   *    - Teams that consistently score high demonstrate strength even if they sometimes lose
   * 
   * 3. Recent Performance (20% weight): Last 3 weeks of play
   *    - Measures how a team is performing lately (getting hot or cooling down)
   *    - Calculated as average points over the last 3 weeks
   *    - Normalized against the highest recent performer in the league
   *    - Allows the rankings to capture teams that are improving or declining
   * 
   * The final power score is a weighted sum of these three factors, producing a score
   * between 0 and 1, where 1 represents a theoretically perfect team.
   */
  
  // Calculate power score based on these weighted components:
  powerRankings.forEach((team) => {
    // Get weekly scores for this team
    const weeklyScores = calculateWeeklyScores(team.rank, matchups);
    
    // Only consider recent non-zero scores (last 3 weeks)
    const recentScores = weeklyScores.slice(-3).filter(score => score > 0);
    
    // 1. Win Percentage (50% weight)
    // Higher win % = stronger team
    const totalGames = team.wins + team.losses + team.ties;
    const winPct = totalGames > 0 ? team.wins / totalGames : 0;
    
    // 2. Points For (30% weight)
    // Find max points in the league for normalization
    const maxPoints = Math.max(...powerRankings.map(t => t.points_for || 0));
    // Normalize points to a 0-1 scale
    const normalizedPoints = maxPoints > 0 ? (team.points_for || 0) / maxPoints : 0;
    
    // 3. Recent Performance (20% weight)
    let recentPerformance = 0;
    if (recentScores.length > 0) {
      // Calculate average recent score
      const avgRecentScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      
      // Find the highest average recent score in the league
      const maxAvgScore = Math.max(...powerRankings.map(t => {
        const tScores = calculateWeeklyScores(t.rank, matchups).slice(-3).filter(score => score > 0);
        return tScores.length > 0 
          ? tScores.reduce((sum, score) => sum + score, 0) / tScores.length 
          : 0;
      }));
      
      // Normalize recent performance to a 0-1 scale
      recentPerformance = maxAvgScore > 0 ? avgRecentScore / maxAvgScore : 0;
    }
    
    // Calculate final power score (weighted sum of all factors)
    const powerScore = (
      (winPct * 0.5) +              // 50% weight for win percentage
      (normalizedPoints * 0.3) +    // 30% weight for points scored
      (recentPerformance * 0.2)     // 20% weight for recent performance
    );
    
    // Store power score for sorting
    (team as any).powerScore = powerScore;
  });
  
  // Sort by power score (higher score = better ranking)
  return powerRankings
    .sort((a, b) => (b as any).powerScore - (a as any).powerScore)
    .map((standing, index) => ({ ...standing, rank: index + 1 }));
}; 