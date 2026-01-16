
// ═══════════════════════════════════════════════════════════════════════════
// CRITICAL: NODE_ENV MUST BE SET BEFORE METRO CONFIG IS EVALUATED
// ═══════════════════════════════════════════════════════════════════════════
// This check MUST be at the very top of this file, before any other imports.
// Expo requires NODE_ENV to be set for proper configuration resolution.
// Without this, the build will fail with:
// "The NODE_ENV environment variable is required but was not specified."
// ═══════════════════════════════════════════════════════════════════════════

if (!process.env.NODE_ENV) {
  // Default to development if not set
  process.env.NODE_ENV = 'development';
  console.warn('⚠️  [Metro Config] NODE_ENV was not set! Defaulting to development.');
  console.warn('⚠️  [Metro Config] For production builds, ensure NODE_ENV=production is set BEFORE running Gradle.');
} else {
  console.log(`✅ [Metro Config] NODE_ENV is correctly set to: ${process.env.NODE_ENV}`);
}

// Validate that we're in a known environment
const validEnvironments = ['development', 'production', 'test'];
if (!validEnvironments.includes(process.env.NODE_ENV)) {
  console.error(`❌ [Metro Config] Invalid NODE_ENV: ${process.env.NODE_ENV}`);
  console.error(`❌ [Metro Config] Must be one of: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Enable package exports for better module resolution
config.resolver.unstable_enablePackageExports = true;

// Metro has built-in caching - it automatically uses node_modules/.cache/metro
// No need to manually configure FileStore or metro-cache
// The cache is managed internally by Metro

// Custom server middleware to receive console.log messages from the app
const LOG_FILE_PATH = path.join(__dirname, '.natively', 'app_console.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE_PATH);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Extract pathname without query params for matching
    const pathname = req.url.split('?')[0];

    // Handle log receiving endpoint
    if (pathname === '/natively-logs' && req.method === 'POST') {
      console.log('[NATIVELY-LOGS] Received POST request');
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const logData = JSON.parse(body);
          const timestamp = logData.timestamp || new Date().toISOString();
          const level = (logData.level || 'log').toUpperCase();
          const message = logData.message || '';
          const source = logData.source || '';
          const platform = logData.platform || '';

          const platformInfo = platform ? `[${platform}] ` : '';
          const sourceInfo = source ? `[${source}] ` : '';
          const logLine = `[${timestamp}] ${platformInfo}[${level}] ${sourceInfo}${message}\n`;

          console.log('[NATIVELY-LOGS] Writing log:', logLine.trim());

          // Rotate log file if too large
          try {
            if (fs.existsSync(LOG_FILE_PATH) && fs.statSync(LOG_FILE_PATH).size > MAX_LOG_SIZE) {
              const content = fs.readFileSync(LOG_FILE_PATH, 'utf8');
              const lines = content.split('\n');
              fs.writeFileSync(LOG_FILE_PATH, lines.slice(lines.length / 2).join('\n'));
            }
          } catch (e) {
            // Ignore rotation errors
          }

          fs.appendFileSync(LOG_FILE_PATH, logLine);

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end('{"status":"ok"}');
        } catch (e) {
          console.error('[NATIVELY-LOGS] Error processing log:', e.message);
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // Handle CORS preflight for log endpoint
    if (pathname === '/natively-logs' && req.method === 'OPTIONS') {
      console.log('[NATIVELY-LOGS] Received OPTIONS preflight request');
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      });
      res.end();
      return;
    }

    // Pass through to default Metro middleware
    return middleware(req, res, next);
  };
};

module.exports = config;
