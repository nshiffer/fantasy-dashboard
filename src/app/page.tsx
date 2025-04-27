'use client';

import React, { useState, useEffect } from 'react';
import { League, User, Roster, Standing, Matchup, Player } from '../types/sleeper';
import { fetchLeague, fetchRosters, fetchUsers, fetchMatchups, fetchAllPlayers } from '../services/sleeper-api';
import { calculateStandings, calculateWeeklyScores } from '../utils/standings';
import dynamic from 'next/dynamic';

import Navigation from '../components/Navigation';
// Use dynamic imports for components with browser APIs like Chart.js
const StandingsTable = dynamic(() => import('../components/StandingsTable'), { ssr: false });
const TopScorers = dynamic(() => import('../components/TopScorers'), { ssr: false });
const PowerRankings = dynamic(() => import('../components/PowerRankings'), { ssr: false });
const RosterHeatmap = dynamic(() => import('../components/RosterHeatmap'), { ssr: false });
const DraftBoard = dynamic(() => import('../components/DraftBoard'), { ssr: false });
// This component doesn't use Chart.js, so we can import it normally
import MatchupsList from '../components/MatchupsList';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [leagueId, setLeagueId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('overview');
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

  const fetchData = async (leagueId: string) => {
    if (!leagueId) return;
    
    setLeagueData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // For demo purposes, we'll mock the current week
      const currentWeek = 9; // Adjust as needed
      
      // Fetch league data
      const league = await fetchLeague(leagueId);
      const users = await fetchUsers(leagueId);
      const rosters = await fetchRosters(leagueId);
      
      // Calculate standings
      const standings = calculateStandings(rosters, users);
      
      // Fetch matchups for each week
      const matchups: { [week: number]: Matchup[] } = {};
      for (let week = 1; week <= currentWeek; week++) {
        try {
          matchups[week] = await fetchMatchups(leagueId, week);
        } catch (error) {
          console.error(`Failed to fetch matchups for week ${week}:`, error);
          matchups[week] = [];
        }
      }
      
      // Fetch player data (this is a large API call, may want to load from a file in production)
      const players = await fetchAllPlayers();
      
      // Calculate weekly scores for each team
      const weeklyScores: Record<string, number[]> = {};
      
      users.forEach(user => {
        const roster = rosters.find(r => r.owner_id === user.user_id);
        
        if (roster) {
          weeklyScores[user.user_id] = calculateWeeklyScores(roster.roster_id, matchups);
        }
      });
      
      setLeagueData({
        league,
        users,
        rosters,
        standings,
        matchups,
        players,
        currentWeek,
        weeklyScores,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLeagueData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch league data. Please check the league ID and try again.',
      }));
    }
  };

  const handleLeagueIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (leagueId) {
      fetchData(leagueId);
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

  // Show a loading state during server-side rendering
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {!leagueData.league && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition duration-300 hover:shadow-2xl">
              <div className="text-center mb-6">
                <div className="mx-auto h-20 w-20 text-primary-600 bg-primary-50 rounded-full flex items-center justify-center">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-dark-900">Enter Your Sleeper League ID</h2>
                <p className="mt-1 text-gray-500">Connect to your fantasy football league</p>
              </div>
              
              <form onSubmit={handleLeagueIdSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="league-id" className="block text-sm font-medium text-dark-700">
                    League ID
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="league-id"
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="e.g. 123456789"
                      value={leagueId}
                      onChange={(e) => setLeagueId(e.target.value)}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Find your league ID in the URL when you visit your Sleeper league:
                    https://sleeper.app/leagues/<strong className="text-primary-600">YOUR_LEAGUE_ID</strong>
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  disabled={leagueData.loading}
                >
                  {leagueData.loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    'Connect to League'
                  )}
                </button>
              </form>
              
              {leagueData.error && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="ml-3 text-sm text-red-800">
                      {leagueData.error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {leagueData.league && (
          <>
            {/* League Header Card */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                  {leagueData.league.avatar && (
                    <img 
                      src={`https://sleepercdn.com/avatars/${leagueData.league.avatar}`} 
                      alt="League avatar" 
                      className="h-16 w-16 rounded-full border-4 border-primary-100 mr-4" 
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-dark-900">
                      {leagueData.league.name}
                    </h1>
                    <p className="text-gray-500">
                      {leagueData.league.season} Season • {leagueData.users.length} Teams
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setActiveSection('overview')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 'overview' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => { 
                      setActiveSection('standings');
                      window.location.hash = 'standings';
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 'standings' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Standings
                  </button>
                  <button 
                    onClick={() => { 
                      setActiveSection('matchups');
                      window.location.hash = 'matchups';
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 'matchups' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Matchups
                  </button>
                  <button 
                    onClick={() => { 
                      setActiveSection('top-scorers');
                      window.location.hash = 'top-scorers';
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 'top-scorers' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Top Scorers
                  </button>
                  <button 
                    onClick={() => { 
                      setActiveSection('power-rankings');
                      window.location.hash = 'power-rankings';
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 'power-rankings' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Power Rankings
                  </button>
                  <button 
                    onClick={() => { 
                      setActiveSection('roster-analysis');
                      window.location.hash = 'roster-analysis';
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 'roster-analysis' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Roster Analysis
                  </button>
                  <button 
                    onClick={() => { 
                      setActiveSection('draft-board');
                      window.location.hash = 'draft-board';
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 'draft-board' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Draft Board
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content Sections */}
            <div className="space-y-8">
              {activeSection === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div id="standings">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-dark-900">Standings</h2>
                      </div>
                      <div className="p-4">
                        <StandingsTable 
                          standings={leagueData.standings} 
                          weeklyScores={leagueData.weeklyScores}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div id="matchups">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-dark-900">Week {leagueData.currentWeek} Matchups</h2>
                      </div>
                      <div className="p-4">
                        <MatchupsList 
                          matchups={leagueData.matchups[leagueData.currentWeek] || []} 
                          rosters={leagueData.rosters} 
                          users={leagueData.users} 
                          players={leagueData.players}
                          standings={leagueData.standings}
                          week={leagueData.currentWeek}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeSection === 'standings' && (
                <div id="standings" className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-dark-900">League Standings</h2>
                    <p className="text-gray-500">Current standings for the {leagueData.league.season} season</p>
                  </div>
                  <div className="p-6">
                    <StandingsTable 
                      standings={leagueData.standings} 
                      weeklyScores={leagueData.weeklyScores}
                    />
                  </div>
                </div>
              )}
              
              {activeSection === 'matchups' && (
                <div id="matchups" className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-dark-900">Week {leagueData.currentWeek} Matchups</h2>
                    <p className="text-gray-500">Current matchups for week {leagueData.currentWeek}</p>
                  </div>
                  <div className="p-6">
                    <MatchupsList 
                      matchups={leagueData.matchups[leagueData.currentWeek] || []} 
                      rosters={leagueData.rosters} 
                      users={leagueData.users} 
                      players={leagueData.players}
                      standings={leagueData.standings}
                      week={leagueData.currentWeek}
                    />
                  </div>
                </div>
              )}
              
              {activeSection === 'top-scorers' && (
                <div id="top-scorers">
                  <TopScorers 
                    matchups={leagueData.matchups}
                    rosters={leagueData.rosters} 
                    users={leagueData.users} 
                    players={leagueData.players}
                    weeklyScores={leagueData.weeklyScores} 
                    currentWeek={leagueData.currentWeek}
                  />
                </div>
              )}
              
              {activeSection === 'power-rankings' && (
                <div id="power-rankings">
                  <PowerRankings 
                    standings={leagueData.standings}
                    matchups={leagueData.matchups}
                    currentWeek={leagueData.currentWeek}
                  />
                </div>
              )}
              
              {activeSection === 'roster-analysis' && (
                <div id="roster-analysis">
                  <RosterHeatmap 
                    rosters={leagueData.rosters} 
                    users={leagueData.users} 
                    players={leagueData.players}
                    matchups={leagueData.matchups}
                    currentWeek={leagueData.currentWeek}
                  />
                </div>
              )}

              {activeSection === 'draft-board' && (
                <div id="draft-board">
                  <DraftBoard
                    players={leagueData.players}
                    rosters={leagueData.rosters}
                    users={leagueData.users}
                    league={leagueData.league}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            <p>Fantasy Dashboard © {new Date().getFullYear()}</p>
            <p className="mt-1">Data provided by Sleeper API</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
