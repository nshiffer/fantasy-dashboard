'use client';

import React from 'react';

interface DashboardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  titleRight?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  children,
  className = '',
  titleRight
}) => {
  return (
    <div className={`bg-white dark:bg-dark-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-dark-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{title}</h3>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {titleRight && (
            <div>
              {titleRight}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard; 