import { fetchAndSaveLeagueData, FetchConfig } from '../utils/data-fetcher';

/**
 * This script is intended to be run by GitHub Actions on a schedule.
 * It fetches data from the Sleeper API and saves it to the data directory.
 */

const runFetchData = async () => {
  // Get league ID from env var or use default
  const leagueId = process.env.LEAGUE_ID || '';
  const season = process.env.SEASON || new Date().getFullYear().toString();
  
  if (!leagueId) {
    console.error('LEAGUE_ID environment variable is required');
    process.exit(1);
  }
  
  // Get current week (1-18 for NFL regular season)
  const now = new Date();
  const startOfSeason = new Date(parseInt(season), 8, 1); // September 1st of the season year
  
  // Calculate approximate week number
  let currentWeek = Math.floor((now.getTime() - startOfSeason.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  
  // Ensure week is in range 1-18
  currentWeek = Math.max(1, Math.min(18, currentWeek));
  
  // Fetch all weeks up to the current week
  const weeksToFetch = Array.from({ length: currentWeek }, (_, i) => i + 1);
  
  const config: FetchConfig = {
    leagueId,
    season,
    weeksToFetch,
  };
  
  console.log(`Fetching data for league ${leagueId}, season ${season}, weeks 1-${currentWeek}...`);
  
  try {
    await fetchAndSaveLeagueData(config);
    console.log('Data fetched and saved successfully!');
  } catch (error) {
    console.error('Failed to fetch and save data:', error);
    process.exit(1);
  }
};

runFetchData(); 