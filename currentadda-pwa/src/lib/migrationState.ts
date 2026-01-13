/**
 * Migration State Manager
 * Tracks whether user has successfully authenticated post-migration
 */

const MIGRATION_KEY = 'currentadda_migration_acknowledged';
const MIGRATION_VERSION = '2026-01-13'; // Update this if you need to show notices again

export const migrationState = {
  /**
   * Check if user has acknowledged the migration (successfully logged in/registered)
   */
  isAcknowledged(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem(MIGRATION_KEY);
      return stored === MIGRATION_VERSION;
    } catch {
      return false;
    }
  },

  /**
   * Mark migration as acknowledged (user successfully authenticated)
   */
  acknowledge(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(MIGRATION_KEY, MIGRATION_VERSION);
    } catch {
      // Silent fail if localStorage is not available
    }
  },

  /**
   * Reset migration state (for testing or if you need to show notices again)
   */
  reset(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(MIGRATION_KEY);
    } catch {
      // Silent fail
    }
  },

  /**
   * Check if user should see migration notices
   */
  shouldShowNotices(): boolean {
    return !this.isAcknowledged();
  }
};