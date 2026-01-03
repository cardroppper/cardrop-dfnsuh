
# Auto Bug Detection & Navigation Health Monitor

## Overview

CarDrop now includes an **automatic bug detection and fixing system** that monitors all authentication and navigation operations in real-time. This system helps identify and diagnose issues when buttons fail to navigate or operations get stuck.

## Features

### 1. **Automatic Operation Monitoring**
- Tracks all authentication operations (signup, login, logout)
- Monitors navigation attempts
- Detects stuck operations (timeout after 10 seconds)
- Provides real-time health metrics

### 2. **Automatic Retry Logic**
- Implements exponential backoff (1s, 2s, 4s delays)
- Retries failed operations up to 3 times
- Shows retry progress to users
- Logs detailed information for each attempt

### 3. **Enhanced Error Reporting**
- User-friendly error messages
- Actionable suggestions for common issues
- Network connectivity checks
- Detailed diagnostic reports in console

### 4. **Debug Panel (Development Mode)**
- Floating debug button in bottom-right corner
- Real-time system health monitoring
- Navigation statistics
- Network status information
- Export logs to console

## How It Works

### Auto Debugger (`utils/autoDebugger.ts`)

The auto debugger monitors all async operations:

```typescript
// Register an operation
const operationId = autoDebugger.registerOperation('signup');

// Mark as successful
autoDebugger.markSuccess(operationId, duration);

// Or mark as failed
autoDebugger.markFailure(operationId, errorMessage);
```

**Automatic Features:**
- Detects operations stuck for >10 seconds
- Generates diagnostic reports with network status
- Provides actionable feedback based on error type
- Monitors system health continuously

### Execute with Retry

Operations can use automatic retry logic:

```typescript
const result = await autoDebugger.executeWithRetry(
  'operation_name',
  async () => {
    // Your async operation here
    return await someAsyncFunction();
  },
  (attempt, maxAttempts) => {
    // Optional progress callback
    console.log(`Attempt ${attempt}/${maxAttempts}`);
  }
);
```

### Navigation Debugger (`utils/navigationDebugger.ts`)

Tracks navigation attempts and failures:

```typescript
// Log a navigation attempt
navigationDebugger.logAttempt('action', 'from_route', 'to_route');

// Mark as successful
navigationDebugger.markSuccess('action', duration);

// Mark as failed
navigationDebugger.markFailure('action', errorMessage);

// Generate diagnostic report
const report = navigationDebugger.generateReport();
```

## Using the Debug Panel

### Accessing the Panel

In **development mode only**, you'll see a floating button in the bottom-right corner with three dots. Tap it to open the debug panel.

### Panel Sections

1. **System Health**
   - Network connectivity status
   - Number of pending operations
   - Number of failed operations
   - Average response time

2. **Network Status**
   - Connection status
   - Internet reachability
   - Network type (WiFi, Cellular, etc.)

3. **Navigation Report**
   - Total navigation attempts
   - Success rate
   - Recent failures
   - Stuck navigations

4. **Actions**
   - **Refresh Data**: Update all metrics
   - **Clear Logs**: Reset all debug data
   - **Export to Console**: Print detailed logs

## Common Issues & Solutions

### Issue: "Request Timeout"

**Symptoms:**
- Loading spinner for >10 seconds
- No error message
- Button doesn't navigate

**Causes:**
- Slow network connection
- Backend server issues
- Database query timeout

**Solutions:**
1. Check network connection
2. Try again in a few moments
3. Check backend logs for errors
4. Verify database is responding

### Issue: "RLS Policy Violation"

**Symptoms:**
- Error: "new row violates row-level security policy"
- Signup fails after loading

**Causes:**
- Database trigger not working
- RLS policies too restrictive
- Missing permissions

**Solutions:**
1. Verify database trigger exists and is enabled
2. Check RLS policies on profiles table
3. Ensure trigger has SECURITY DEFINER
4. Check database logs for trigger errors

### Issue: "Profile Not Found"

**Symptoms:**
- Login succeeds but profile doesn't load
- Stuck on loading screen

**Causes:**
- Database trigger failed to create profile
- Profile creation race condition
- Network timeout during profile fetch

**Solutions:**
1. The system automatically retries up to 8 times
2. Check database logs for trigger errors
3. Verify user exists in auth.users
4. Check if profile exists in profiles table

## Database Trigger

The app uses a database trigger to automatically create profiles when users sign up:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Key Features:**
- Runs with SECURITY DEFINER (bypasses RLS)
- Extracts username and display_name from metadata
- Provides fallback values if metadata is missing
- Logs all attempts and errors
- Handles exceptions gracefully

## Monitoring in Production

While the debug panel is only available in development mode, the auto debugger still runs in production and logs to the console. You can:

1. **Check Console Logs**
   - Look for `[AutoDebugger]` prefixed messages
   - Check for timeout warnings
   - Review error diagnostics

2. **Monitor Health Metrics**
   ```typescript
   const health = await autoDebugger.checkSystemHealth();
   console.log(health);
   ```

3. **Export Health Summary**
   ```typescript
   const summary = await autoDebugger.getHealthSummary();
   console.log(summary);
   ```

## Best Practices

### For Developers

1. **Always use autoDebugger for critical operations**
   ```typescript
   const operationId = autoDebugger.registerOperation('critical_action');
   try {
     await performAction();
     autoDebugger.markSuccess(operationId);
   } catch (error) {
     autoDebugger.markFailure(operationId, error.message);
   }
   ```

2. **Use executeWithRetry for network operations**
   ```typescript
   const result = await autoDebugger.executeWithRetry(
     'fetch_data',
     () => fetchFromAPI()
   );
   ```

3. **Log navigation attempts**
   ```typescript
   navigationDebugger.logAttempt('navigate', currentRoute, targetRoute);
   router.push(targetRoute);
   navigationDebugger.markSuccess('navigate');
   ```

### For Users

1. **Check the debug panel if something seems stuck**
2. **Look for timeout warnings**
3. **Export logs before reporting issues**
4. **Note the network status when issues occur**

## Troubleshooting

### Debug Panel Not Showing

- Ensure you're in development mode (`__DEV__ === true`)
- Check that FloatingDebugButton is rendered in _layout.tsx
- Verify no other UI elements are covering it

### Operations Not Being Tracked

- Ensure autoDebugger.registerOperation() is called
- Check that markSuccess/markFailure is called
- Verify no exceptions are swallowing the tracking calls

### Retries Not Working

- Check network connectivity
- Verify the operation is wrapped in executeWithRetry
- Look for exceptions in the operation function
- Check console for retry attempt logs

## Technical Details

### Timeout Detection

Operations are checked every 3 seconds. If an operation has been pending for >10 seconds, it's marked as timed out and a diagnostic report is generated.

### Retry Delays

Exponential backoff with delays:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay
- Attempt 4: 4 second delay (if max retries increased)

### Health Metrics

- **Pending Operations**: Currently running operations
- **Failed Operations**: Operations that failed or timed out
- **Avg Response Time**: Average duration of successful operations
- **Network Status**: Real-time network connectivity

## Future Enhancements

Planned improvements:

1. **Remote Logging**: Send diagnostics to backend for analysis
2. **Crash Reporting**: Integrate with crash reporting service
3. **Performance Metrics**: Track app performance over time
4. **User Feedback**: Allow users to report issues directly from debug panel
5. **Automatic Recovery**: Attempt to fix common issues automatically

## Support

If you encounter issues that the auto debugger can't resolve:

1. Export the debug logs
2. Check the console for detailed error messages
3. Review the navigation report for patterns
4. Contact support with the exported logs

---

**Remember**: The auto bug detection system is your friend! It's designed to help you identify and fix issues quickly. Use it whenever something doesn't work as expected.
