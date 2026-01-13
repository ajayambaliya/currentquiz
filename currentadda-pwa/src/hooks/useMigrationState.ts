'use client';

import { useState, useEffect } from 'react';
import { migrationState } from '@/lib/migrationState';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to manage migration notice visibility
 * Automatically hides notices for authenticated users
 */
export const useMigrationState = () => {
  const [shouldShowNotices, setShouldShowNotices] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // If user is already authenticated, acknowledge migration automatically
    if (user) {
      migrationState.acknowledge();
      setShouldShowNotices(false);
    } else {
      // Check if migration notices should be shown
      setShouldShowNotices(migrationState.shouldShowNotices());
    }
  }, [user]);

  return {
    shouldShowNotices,
    acknowledgeMigration: () => {
      migrationState.acknowledge();
      setShouldShowNotices(false);
    },
    resetMigrationState: () => {
      migrationState.reset();
      setShouldShowNotices(true);
    }
  };
};