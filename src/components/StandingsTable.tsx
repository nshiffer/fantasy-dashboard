'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Standing } from '../types/sleeper';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface StandingsTableProps {
  standings: Standing[];
  weeklyScores: Record<string, number[]>;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ standings, weeklyScores }) => {
  // Function to generate sparkline data
  const generateSparklineData = (userId: string) => {
    const scores = weeklyScores[userId] || [];
    
    return {
      labels: scores.map((_, i) => `Week ${i + 1}`),
      datasets: [
        {
          data: scores,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
          pointRadius: 0,
          borderWidth: 1,
          tension: 0.1,
        },
      ],
    };
  };
  
  // Sparkline options - minimalistic
  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };
  
  // Format streak as a string (e.g. W3 for 3-game win streak, L2 for 2-game losing streak)
  const formatStreak = (streak: number) => {
    if (streak > 0) {
      return `W${streak}`;
    } else if (streak < 0) {
      return `L${Math.abs(streak)}`;
    }
    return '-';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Record
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PCT
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PF
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PA
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Streak
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trend
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((team) => (
            <tr key={team.user_id} className={team.rank <= 6 ? 'bg-green-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {team.rank}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center">
                  {team.avatar && (
                    <img 
                      src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`} 
                      alt="Team avatar" 
                      className="h-8 w-8 rounded-full mr-2" 
                    />
                  )}
                  <span>{team.team_name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {((team.wins / (team.wins + team.losses + team.ties)) || 0).toFixed(3)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {team.points_for != null ? team.points_for.toFixed(2) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {team.points_against != null ? team.points_against.toFixed(2) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-md ${team.streak > 0 ? 'bg-green-100 text-green-800' : team.streak < 0 ? 'bg-red-100 text-red-800' : ''}`}>
                  {formatStreak(team.streak)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="h-10 w-24">
                  {weeklyScores[team.user_id] && weeklyScores[team.user_id].length > 0 ? (
                    <Line data={generateSparklineData(team.user_id)} options={sparklineOptions} />
                  ) : (
                    <span className="text-gray-400">No data</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable; 