
/**
 * Automatic Bug Detection and Navigation Health Monitor
 * 
 * This system automatically:
 * 1. Detects when buttons fail to navigate after loading
 * 2. Monitors authentication flow issues
 * 3. Provides automatic retry logic with exponential backoff
 * 4. Logs detailed diagnostic information
 * 5. Shows user-friendly error messages
 */

import { Alert } from 'react-native';
import * as Network from 'expo-network';

interface HealthCheck {
  timestamp: number;
  action: string;
  status: 'pending' | 'success' | 'failed' | 'timeout';
  duration?: number;
  error?: string;
  retryCount: number;
  networkStatus?: string;
}

interface DiagnosticData {
  action: string;
  error: string;
  networkConnected: boolean;
  timestamp: string;
  duration: number;
  retryCount: number;
  stackTrace?: string;
}

class AutoDebugger {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private readonly TIMEOUT_THRESHOLD = 10000; // 10 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMonitoring();
  }

  /**
   * Start monitoring for stuck operations
   */
  private startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Check every 3 seconds for stuck operations
    this.monitoringInterval = setInterval(() => {
      this.detectStuckOperations();
    }, 3000);
  }

  /**
   * Register a new operation to monitor
   */
  registerOperation(action: string): string {
    const operationId = `${action}_${Date.now()}`;
    
    this.healthChecks.set(operationId, {
      timestamp: Date.now(),
      action,
      status: 'pending',
      retryCount: 0,
    });

    console.log(`[AutoDebugger] 🔵 Registered operation: ${action} (${operationId})`);
    return operationId;
  }

  /**
   * Mark operation as successful
   */
  markSuccess(operationId: string, duration?: number) {
    const check = this.healthChecks.get(operationId);
    if (check) {
      check.status = 'success';
      check.duration = duration || Date.now() - check.timestamp;
      
      console.log(`[AutoDebugger] ✅ Operation succeeded: ${check.action} (${check.duration}ms)`);
      
      // Clean up after 5 seconds
      setTimeout(() => {
        this.healthChecks.delete(operationId);
      }, 5000);
    }
  }

  /**
   * Mark operation as failed
   */
  markFailure(operationId: string, error: string) {
    const check = this.healthChecks.get(operationId);
    if (check) {
      check.status = 'failed';
      check.error = error;
      check.duration = Date.now() - check.timestamp;
      
      console.error(`[AutoDebugger] ❌ Operation failed: ${check.action} - ${error}`);
      
      // Generate diagnostic report
      this.generateDiagnosticReport(check);
    }
  }

  /**
   * Detect operations that are stuck (taking too long)
   */
  private detectStuckOperations() {
    const now = Date.now();
    
    this.healthChecks.forEach((check, operationId) => {
      if (check.status === 'pending') {
        const elapsed = now - check.timestamp;
        
        if (elapsed > this.TIMEOUT_THRESHOLD) {
          console.warn(`[AutoDebugger] ⚠️ Operation timeout detected: ${check.action} (${elapsed}ms)`);
          
          check.status = 'timeout';
          check.duration = elapsed;
          
          // Generate diagnostic report
          this.generateDiagnosticReport(check);
          
          // Clean up
          this.healthChecks.delete(operationId);
        }
      }
    });
  }

  /**
   * Generate detailed diagnostic report
   */
  private async generateDiagnosticReport(check: HealthCheck) {
    const networkState = await Network.getNetworkStateAsync();
    
    const diagnostic: DiagnosticData = {
      action: check.action,
      error: check.error || 'Operation timeout',
      networkConnected: networkState.isConnected || false,
      timestamp: new Date(check.timestamp).toISOString(),
      duration: check.duration || Date.now() - check.timestamp,
      retryCount: check.retryCount,
    };

    console.error('🚨 DIAGNOSTIC REPORT:', JSON.stringify(diagnostic, null, 2));

    // Provide actionable feedback
    this.provideActionableFeedback(diagnostic);
  }

  /**
   * Provide user-friendly, actionable feedback
   */
  private provideActionableFeedback(diagnostic: DiagnosticData) {
    let message = '';
    let suggestions: string[] = [];

    if (!diagnostic.networkConnected) {
      message = 'No Internet Connection';
      suggestions = [
        '• Check your WiFi or mobile data',
        '• Try moving to an area with better signal',
        '• Restart your device if the problem persists',
      ];
    } else if (diagnostic.duration > 10000) {
      message = 'Request Timeout';
      suggestions = [
        '• The server might be slow or unavailable',
        '• Check if you have a stable internet connection',
        '• Try again in a few moments',
      ];
    } else if (diagnostic.error.includes('RLS') || diagnostic.error.includes('policy')) {
      message = 'Database Permission Error';
      suggestions = [
        '• This is a backend configuration issue',
        '• The database security policies need adjustment',
        '• Contact support if this persists',
      ];
    } else if (diagnostic.error.includes('already registered') || diagnostic.error.includes('already exists')) {
      message = 'Account Already Exists';
      suggestions = [
        '• Try logging in instead of signing up',
        '• Use the "Forgot Password" option if needed',
        '• Contact support if you believe this is an error',
      ];
    } else {
      message = 'Something Went Wrong';
      suggestions = [
        '• Try the action again',
        '• Restart the app if the problem persists',
        '• Contact support if you continue to experience issues',
      ];
    }

    console.error(`\n🔍 ACTIONABLE FEEDBACK:\n${message}\n${suggestions.join('\n')}\n`);
  }

  /**
   * Execute operation with automatic retry logic
   */
  async executeWithRetry<T>(
    action: string,
    operation: () => Promise<T>,
    onProgress?: (attempt: number, maxAttempts: number) => void
  ): Promise<T> {
    const operationId = this.registerOperation(action);
    let lastError: any;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[AutoDebugger] 🔄 Attempt ${attempt + 1}/${this.MAX_RETRIES} for ${action}`);
        
        if (onProgress) {
          onProgress(attempt + 1, this.MAX_RETRIES);
        }

        const startTime = Date.now();
        const result = await operation();
        const duration = Date.now() - startTime;

        this.markSuccess(operationId, duration);
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`[AutoDebugger] ❌ Attempt ${attempt + 1} failed:`, error.message);

        // Update retry count
        const check = this.healthChecks.get(operationId);
        if (check) {
          check.retryCount = attempt + 1;
        }

        // If not the last attempt, wait before retrying
        if (attempt < this.MAX_RETRIES - 1) {
          const delay = this.RETRY_DELAYS[attempt];
          console.log(`[AutoDebugger] ⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    this.markFailure(operationId, lastError?.message || 'All retry attempts failed');
    throw lastError;
  }

  /**
   * Check system health
   */
  async checkSystemHealth(): Promise<{
    network: boolean;
    pendingOperations: number;
    failedOperations: number;
    avgResponseTime: number;
  }> {
    const networkState = await Network.getNetworkStateAsync();
    
    const pending = Array.from(this.healthChecks.values()).filter(
      c => c.status === 'pending'
    ).length;
    
    const failed = Array.from(this.healthChecks.values()).filter(
      c => c.status === 'failed' || c.status === 'timeout'
    ).length;
    
    const successful = Array.from(this.healthChecks.values()).filter(
      c => c.status === 'success' && c.duration
    );
    
    const avgResponseTime = successful.length > 0
      ? successful.reduce((sum, c) => sum + (c.duration || 0), 0) / successful.length
      : 0;

    return {
      network: networkState.isConnected || false,
      pendingOperations: pending,
      failedOperations: failed,
      avgResponseTime: Math.round(avgResponseTime),
    };
  }

  /**
   * Get health status summary
   */
  async getHealthSummary(): Promise<string> {
    const health = await this.checkSystemHealth();
    
    let summary = '=== System Health Summary ===\n\n';
    summary += `Network: ${health.network ? '✅ Connected' : '❌ Disconnected'}\n`;
    summary += `Pending Operations: ${health.pendingOperations}\n`;
    summary += `Failed Operations: ${health.failedOperations}\n`;
    summary += `Avg Response Time: ${health.avgResponseTime}ms\n`;
    
    if (health.failedOperations > 0) {
      summary += '\n⚠️ Some operations have failed. Check logs for details.\n';
    }
    
    if (!health.network) {
      summary += '\n❌ No network connection detected!\n';
    }
    
    summary += '\n============================\n';
    
    return summary;
  }

  /**
   * Clear all health checks
   */
  clear() {
    this.healthChecks.clear();
    console.log('[AutoDebugger] 🧹 Cleared all health checks');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Singleton instance
export const autoDebugger = new AutoDebugger();

// Cleanup on app termination
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    autoDebugger.stopMonitoring();
  });
}
