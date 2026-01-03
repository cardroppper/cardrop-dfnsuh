
/**
 * Automatic Navigation Bug Detector
 * 
 * This utility monitors navigation actions and detects when buttons
 * fail to navigate users to the expected destination.
 */

interface NavigationAttempt {
  timestamp: number;
  action: string;
  from: string;
  to?: string;
  success: boolean;
  error?: string;
  duration?: number;
}

class NavigationDebugger {
  private attempts: NavigationAttempt[] = [];
  private maxAttempts = 50;
  private timeoutThreshold = 10000; // 10 seconds

  /**
   * Log a navigation attempt
   */
  logAttempt(action: string, from: string, to?: string) {
    const attempt: NavigationAttempt = {
      timestamp: Date.now(),
      action,
      from,
      to,
      success: false,
    };

    this.attempts.push(attempt);
    
    // Keep only recent attempts
    if (this.attempts.length > this.maxAttempts) {
      this.attempts.shift();
    }

    console.log(`[NavigationDebugger] 🔵 Attempt: ${action} from ${from} to ${to || 'unknown'}`);

    return attempt;
  }

  /**
   * Mark an attempt as successful
   */
  markSuccess(action: string, duration?: number) {
    const attempt = this.attempts
      .slice()
      .reverse()
      .find(a => a.action === action && !a.success);

    if (attempt) {
      attempt.success = true;
      attempt.duration = duration;
      console.log(`[NavigationDebugger] ✅ Success: ${action} (${duration}ms)`);
    }
  }

  /**
   * Mark an attempt as failed
   */
  markFailure(action: string, error: string) {
    const attempt = this.attempts
      .slice()
      .reverse()
      .find(a => a.action === action && !a.success);

    if (attempt) {
      attempt.error = error;
      console.error(`[NavigationDebugger] ❌ Failed: ${action} - ${error}`);
    }
  }

  /**
   * Detect stuck navigation (loading for too long)
   */
  detectStuckNavigation(): NavigationAttempt[] {
    const now = Date.now();
    const stuckAttempts = this.attempts.filter(
      attempt =>
        !attempt.success &&
        now - attempt.timestamp > this.timeoutThreshold
    );

    if (stuckAttempts.length > 0) {
      console.warn(
        `[NavigationDebugger] ⚠️ Detected ${stuckAttempts.length} stuck navigation attempts:`,
        stuckAttempts
      );
    }

    return stuckAttempts;
  }

  /**
   * Get navigation statistics
   */
  getStats() {
    const total = this.attempts.length;
    const successful = this.attempts.filter(a => a.success).length;
    const failed = this.attempts.filter(a => a.error).length;
    const pending = total - successful - failed;

    const avgDuration =
      this.attempts
        .filter(a => a.duration)
        .reduce((sum, a) => sum + (a.duration || 0), 0) /
      (successful || 1);

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgDuration: Math.round(avgDuration),
    };
  }

  /**
   * Get recent failures
   */
  getRecentFailures(count = 5): NavigationAttempt[] {
    return this.attempts
      .filter(a => a.error)
      .slice(-count)
      .reverse();
  }

  /**
   * Clear all attempts
   */
  clear() {
    this.attempts = [];
    console.log('[NavigationDebugger] 🧹 Cleared all attempts');
  }

  /**
   * Generate diagnostic report
   */
  generateReport(): string {
    const stats = this.getStats();
    const failures = this.getRecentFailures();
    const stuck = this.detectStuckNavigation();

    let report = '\n=== Navigation Diagnostic Report ===\n\n';
    report += `Total Attempts: ${stats.total}\n`;
    report += `Successful: ${stats.successful} (${stats.successRate.toFixed(1)}%)\n`;
    report += `Failed: ${stats.failed}\n`;
    report += `Pending: ${stats.pending}\n`;
    report += `Avg Duration: ${stats.avgDuration}ms\n\n`;

    if (stuck.length > 0) {
      report += `⚠️ STUCK NAVIGATIONS (${stuck.length}):\n`;
      stuck.forEach(attempt => {
        report += `  - ${attempt.action} from ${attempt.from} (${Math.round((Date.now() - attempt.timestamp) / 1000)}s ago)\n`;
      });
      report += '\n';
    }

    if (failures.length > 0) {
      report += `❌ RECENT FAILURES (${failures.length}):\n`;
      failures.forEach(attempt => {
        report += `  - ${attempt.action}: ${attempt.error}\n`;
      });
      report += '\n';
    }

    report += '===================================\n';

    return report;
  }
}

// Singleton instance
export const navigationDebugger = new NavigationDebugger();

// Auto-detect stuck navigations every 15 seconds
if (__DEV__) {
  setInterval(() => {
    const stuck = navigationDebugger.detectStuckNavigation();
    if (stuck.length > 0) {
      console.warn(navigationDebugger.generateReport());
    }
  }, 15000);
}
