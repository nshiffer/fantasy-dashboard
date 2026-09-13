'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { League, User, Roster, Standing, Matchup, Player } from '../types/sleeper';
import { fetchAllPlayers, fetchLeague, fetchMatchups, fetchNflState, fetchRosters, fetchUsers } from '../services/sleeper-api';
import { calculateStandings, calculateWeeklyScores } from '../utils/standings';
import dynamic from 'next/dynamic';
import Navigation from '../components/Navigation';
import DashboardStats from '../components/ui/DashboardStats';
import DashboardCard from '../components/ui/DashboardCard';
import Loading from '../components/ui/Loading';

// Remove Navigation import since it's now in the layout
// Use dynamic imports for components with browser APIs like Chart.js
const StandingsTable = dynamic(() => import('../components/StandingsTable'), { ssr: false });
const TopScorers = dynamic(() => import('../components/TopScorers'), { ssr: false });
const RosterHeatmap = dynamic(() => import('../components/RosterHeatmap'), { ssr: false });
const DraftBoard = dynamic(() => import('../components/DraftBoard'), { ssr: false });
// This component doesn't use Chart.js, so we can import it normally
import MatchupsList from '../components/MatchupsList';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [leagueId, setLeagueId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [playerDataStatus, setPlayerDataStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [leagueData, setLeagueData] = useState<{
    league: League | null;
    users: User[];
    rosters: Roster[];
    standings: Standing[];
    matchups: { [week: number]: Matchup[] };
    players: { [key: string]: Player };
    currentWeek: number;
    weeklyScores: Record<string, number[]>;
    loading: boolean;
    error: string | null;
  }>({
    league: null,
    users: [],
    rosters: [],
    standings: [],
    matchups: {},
    players: {},
    currentWeek: 0,
    weeklyScores: {},
    loading: false,
    error: null,
  });

  const fetchData = async (submittedLeagueId: string) => {
    if (!submittedLeagueId) return;

    setLeagueData((previous) => ({ ...previous, loading: true, error: null, players: {} }));
    setPlayerDataStatus('idle');

    try {
      const [league, users, rosters, nflState] = await Promise.all([
        fetchLeague(submittedLeagueId),
        fetchUsers(submittedLeagueId),
        fetchRosters(submittedLeagueId),
        fetchNflState(),
      ]);
      const isOffseason = league.status === 'complete' || league.status === 'pre_draft';
      const currentWeek = isOffseason ? 0 : Math.max(1, nflState.week || 1);
      const matchupEntries = isOffseason
        ? []
        : await Promise.all(
            Array.from({ length: currentWeek }, (_, index) => index + 1).map(async (week) => {
              try {
                return [week, await fetchMatchups(submittedLeagueId, week)] as const;
              } catch (error) {
                console.error(`Failed to fetch matchups for week ${week}:`, error);
                return [week, []] as const;
              }
            })
          );
      const matchups = Object.fromEntries(matchupEntries) as Record<number, Matchup[]>;
      const standings = isOffseason
        ? users.map((user, index) => ({
            user_id: user.user_id,
            username: user.display_name || user.username,
            team_name: user.metadata?.team_name,
            avatar: user.avatar,
            wins: 0,
            losses: 0,
            ties: 0,
            points_for: 0,
            points_against: 0,
            streak: 0,
            rank: index + 1,
          }))
        : calculateStandings(rosters, users);
      const weeklyScores: Record<string, number[]> = {};

      users.forEach((user) => {
        const roster = rosters.find((candidate) => candidate.owner_id === user.user_id);
        weeklyScores[user.user_id] = roster && !isOffseason
          ? calculateWeeklyScores(roster.roster_id, matchups)
          : [];
      });

      setLeagueData({
        league,
        users,
        rosters,
        standings,
        matchups,
        players: {},
        currentWeek,
        weeklyScores,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLeagueData((previous) => ({
        ...previous,
        loading: false,
        error: 'Failed to fetch league data. Check the league ID and try again.',
      }));
    }
  };

  const loadPlayers = useCallback(async () => {
    if (playerDataStatus !== 'idle' || Object.keys(leagueData.players).length > 0) return;

    setPlayerDataStatus('loading');
    try {
      const players = await fetchAllPlayers();
      setLeagueData((previous) => ({ ...previous, players }));
      setPlayerDataStatus('loaded');
    } catch (error) {
      console.error('Failed to fetch player data:', error);
      setPlayerDataStatus('error');
    }
  }, [leagueData.players, playerDataStatus]);

  useEffect(() => {
    if (leagueData.league && (activeSection === 'roster-analysis' || activeSection === 'draft-board')) {
      void loadPlayers();
    }
  }, [activeSection, leagueData.league, loadPlayers]);

  const renderPlayerData = (content: React.ReactNode) => {
    if (playerDataStatus === 'loading') return <Loading text="Loading player data..." />;
    if (playerDataStatus === 'error') {
      return <p className="text-red-600 dark:text-red-400">Player data could not be loaded. Please try again.</p>;
    }
    return content;
  };

  const handleLeagueIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedLeagueId = leagueId.trim();
    if (normalizedLeagueId) {
      setLeagueId(normalizedLeagueId);
      void fetchData(normalizedLeagueId);
    }
  };

  // Add logout handler
  const handleLogout = () => {
    // Clear the league ID from localStorage
    localStorage.removeItem('fantasyLeagueId');

    // Reset the app state
    setLeagueId('');
    setLeagueData({
      league: null,
      users: [],
      rosters: [],
      standings: [],
      matchups: {},
      players: {},
      currentWeek: 0,
      weeklyScores: {},
      loading: false,
      error: null,
    });

    // Reset active section to overview
    setActiveSection('overview');

    // Clear hash from URL
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only run localStorage effects when component is mounted
  useEffect(() => {
    if (!isMounted) return;

    const savedLeagueId = localStorage.getItem('fantasyLeagueId');

    if (savedLeagueId) {
      setLeagueId(savedLeagueId);
      fetchData(savedLeagueId);
    }
  }, [isMounted]);

  // Save leagueId to localStorage when it changes
  useEffect(() => {
    if (!isMounted || !leagueId) return;
    localStorage.setItem('fantasyLeagueId', leagueId);
  }, [leagueId, isMounted]);

  // Handle navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveSection(hash);
      }
    };

    // Set initial section from URL hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const leagueInfo = leagueData.league ? {
    name: leagueData.league.name,
    avatar: leagueData.league.avatar,
    season: leagueData.league.season,
    teamCount: leagueData.league.total_rosters
  } : undefined;

  const renderOverviewSection = () => {
    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <DashboardStats
          league={leagueData.league}
          standings={leagueData.standings}
          currentWeek={leagueData.currentWeek}
          totalTeams={leagueData.rosters.length}
        />

        {/* Top Section - Matchups */}
        <DashboardCard
          title={`Week ${leagueData.currentWeek} Matchups`}
          description="Latest matchups in your league"
        >
          <MatchupsList
            matchups={leagueData.matchups[leagueData.currentWeek] || []}
            rosters={leagueData.rosters}
            users={leagueData.users}
            players={leagueData.players}
            standings={leagueData.standings}
            week={leagueData.currentWeek}
          />
        </DashboardCard>

        {/* Top Scorers Section */}
        <DashboardCard
          title="Top Performers"
          description="Weekly and season leaders"
        >
          <TopScorers
            matchups={leagueData.matchups}
            rosters={leagueData.rosters}
            users={leagueData.users}
            players={leagueData.players}
            weeklyScores={leagueData.weeklyScores}
            currentWeek={leagueData.currentWeek}
          />
        </DashboardCard>

        {/* Standings moved to bottom since most apps have built-in standings */}
        <DashboardCard
          title="League Standings & Power Rankings"
          description="View traditional standings or our power rankings formula"
          titleRight={
            <span className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
              Toggle between views
            </span>
          }
        >
          <StandingsTable
            standings={leagueData.standings}
            weeklyScores={leagueData.weeklyScores}
            matchups={leagueData.matchups}
            currentWeek={leagueData.currentWeek}
          />
        </DashboardCard>
      </div>
    );
  };

  // Determine which section to render
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'standings':
        return (
          <DashboardCard
            title="League Standings & Power Rankings"
            description="View traditional standings or our power rankings formula"
            className="mb-6"
            titleRight={
              <span className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                Toggle between views
              </span>
            }
          >
            <StandingsTable
              standings={leagueData.standings}
              weeklyScores={leagueData.weeklyScores}
              matchups={leagueData.matchups}
              currentWeek={leagueData.currentWeek}
            />
          </DashboardCard>
        );
      case 'matchups':
        return (
          <DashboardCard
            title={`Week ${leagueData.currentWeek} Matchups`}
            description="Current matchups in your league"
            className="mb-6"
          >
            <MatchupsList
              matchups={leagueData.matchups[leagueData.currentWeek] || []}
              rosters={leagueData.rosters}
              users={leagueData.users}
              players={leagueData.players}
              standings={leagueData.standings}
              week={leagueData.currentWeek}
            />
          </DashboardCard>
        );
      case 'top-scorers':
        return (
          <DashboardCard
            title="Top Performers"
            description="Weekly and season leaders"
            className="mb-6"
          >
            <TopScorers
              matchups={leagueData.matchups}
              rosters={leagueData.rosters}
              users={leagueData.users}
              players={leagueData.players}
              weeklyScores={leagueData.weeklyScores}
              currentWeek={leagueData.currentWeek}
            />
          </DashboardCard>
        );
      case 'power-rankings':
        // Redirect to standings with power rankings view
        if (typeof window !== 'undefined') {
          window.location.hash = 'standings';
        }
        return (
          <DashboardCard
            title="League Standings & Power Rankings"
            description="View traditional standings or our power rankings formula"
            className="mb-6"
            titleRight={
              <span className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                Toggle between views
              </span>
            }
          >
            <StandingsTable
              standings={leagueData.standings}
              weeklyScores={leagueData.weeklyScores}
              matchups={leagueData.matchups}
              currentWeek={leagueData.currentWeek}
            />
          </DashboardCard>
        );
      case 'roster-analysis':
        return (
          <DashboardCard
            title="Roster Analysis"
            description="Analyze roster strengths and weaknesses"
            className="mb-6"
          >
            {renderPlayerData(
              <RosterHeatmap
                matchups={leagueData.matchups}
                rosters={leagueData.rosters}
                users={leagueData.users}
                players={leagueData.players}
                currentWeek={leagueData.currentWeek}
              />
            )}
          </DashboardCard>
        );
      case 'draft-board':
        return (
          <div className="mb-6">
            {leagueData.league && renderPlayerData(
                <DraftBoard
                  league={leagueData.league}
                  rosters={leagueData.rosters}
                  users={leagueData.users}
                  players={leagueData.players}
                />
            )}
          </div>
        );
      case 'overview':
      default:
        return renderOverviewSection();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      <Navigation
        leagueInfo={leagueInfo}
        currentSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Login form if no league is loaded */}
        {!leagueData.league && !leagueData.loading && (
          <div className="max-w-lg mx-auto mt-12">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sleeper fantasy football league insights</h1>
              <p className="mt-3 text-gray-600 dark:text-gray-300">Analyze standings, scoring, rosters, and draft needs for any Sleeper league.</p>
            </div>
            <DashboardCard
              title="Connect a Sleeper league"
              description="Enter a league ID to load its dashboard."
            >
              <form onSubmit={handleLeagueIdSubmit} className="space-y-6">
                <div>
                  <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sleeper League ID
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]+"
                      maxLength={30}
                      name="leagueId"
                      id="leagueId"
                      value={leagueId}
                      onChange={(e) => setLeagueId(e.target.value)}
                      placeholder="Enter your Sleeper league ID"
                      className="block w-full py-3 px-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white sm:text-sm"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    You can find your league ID in the URL of your Sleeper league.
                  </p>
                  {leagueData.error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {leagueData.error}
                    </p>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 12L13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18 15L21 12L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13 7V6C13 4.89543 12.1046 4 11 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H11C12.1046 20 13 19.1046 13 18V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Connect League
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-gray-200 dark:border-dark-700 pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Not sure where to find your league ID?</h3>
                <ol className="mt-2 text-sm text-gray-500 dark:text-gray-400 list-decimal list-inside space-y-1">
                  <li>Log in to your Sleeper account</li>
                  <li>Navigate to your fantasy football league</li>
                  <li>Look at the URL: sleeper.app/leagues/<strong className="text-primary-600 dark:text-primary-400">YOUR_LEAGUE_ID</strong></li>
                  <li>Copy and paste the league ID into the field above</li>
                </ol>
              </div>
            </DashboardCard>

            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                Your league ID is saved only in this browser. Fantasy Dashboard does not require your Sleeper account credentials.
              </p>
            </div>
          </div>
        )}

        {leagueData.loading && (
          <div className="py-12">
            <Loading text="Fetching league data..." />
          </div>
        )}

        {leagueData.league && (
          <div className="space-y-8">
            {renderActiveSection()}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>Fantasy Dashboard © {new Date().getFullYear()}</p>
            <p className="mt-1">Data provided by Sleeper API</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
