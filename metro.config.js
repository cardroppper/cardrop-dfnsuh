
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Ensure NODE_ENV is set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const config = getDefaultConfig(__dirname);

// Disable package exports to use main field instead
config.resolver.unstable_enablePackageExports = false;

// Configure resolver for better compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Ensure proper source extensions - ADD .mjs and .cjs for Supabase compatibility
config.resolver.sourceExts = [
  'expo.ts',
  'expo.tsx',
  'expo.js',
  'expo.jsx',
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',  // Added for ES modules like @supabase/supabase-js
  'cjs',  // Added for CommonJS modules
  'json',
  'wasm',
  'svg',
];

// Add asset extensions
config.resolver.assetExts = [
  ...(config.resolver.assetExts || []),
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
];

// Add platform-specific extensions for better resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Blacklist/blocklist problematic modules on web
config.resolver.blockList = [
  // Block native-only Stripe imports on web
  /node_modules\/@stripe\/stripe-react-native\/.*\.native\.js$/,
];

// Metro will use its default file-based cache automatically
// No need to manually configure cacheStores

// Configure minifier for production builds
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  console.log('[Metro] Configuring production build with minification');
  
  config.transformer = {
    ...config.transformer,
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        reduce_funcs: true,
        passes: 3,
      },
      mangle: {
        keep_fnames: false,
      },
      output: {
        comments: false,
        ascii_only: true,
      },
    },
  };
}

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
          console.error('[Metro] Error processing log:', e.message);
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
