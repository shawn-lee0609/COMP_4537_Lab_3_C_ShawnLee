// server.js

// Node.js built-in modules

// Provides services to create HTTP server
const http = require('http');  // Create HTTP server

// Provides services to parse URL strings
const url = require('url');    // Parse URLs

// Provides services to manipulate paths for files
const path = require('path');  // Manipulate paths

// Import our custom classes
const FileManager = require('./classes/FileManager');
const RequestHandler = require('./classes/RequestHandler');
const ResponseFormatter = require('./classes/ResponseFormatter');

// ===== Configuration Section =====

// 1. Server port number (configurable via environment variable)
const PORT = process.env.PORT || 3000;
// process.env.PORT - Auto-assigned by hosting services like Azure
// || 3000 - Use port 3000 if environment variable not set

// 2. File storage directory configuration
const FILES_DIR = path.join(__dirname, 'files');
// __dirname - Absolute path of directory where it contains "server.js"
// Example: /home/user/Lab3

// ===== Dependency Creation (Dependency Injection) =====

// 3. Create FileManager instance
const fileManager = new FileManager(FILES_DIR);
// Create FileManager to manage files/ directory

// 4. Create RequestHandler instance (inject FileManager)
const requestHandler = new RequestHandler(fileManager);
// Connect RequestHandler to use FileManager

// ===== HTTP Server Creation =====

/**
 * Create HTTP server and handle requests
 * All HTTP requests are passed to this callback function
 */
const server = http.createServer(async (req, res) => {
  
  // 1. Parse URL (separate path and query parameters)
  const parsedUrl = url.parse(req.url, true);
  // true - Automatically parse query string into object
  // Example: /writeFile/?text=BCIT
  //     pathname: '/writeFile/'
  //     query: { text: 'BCIT' }

  const pathname = parsedUrl.pathname;  // URL path portion
  const query = parsedUrl.query;        // Query parameters object

  // 2. Set CORS headers (apply to all responses)
  res.setHeader('Access-Control-Allow-Origin', '*');
  // * - Allow API calls from all domains (for development)
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  // Specify allowed HTTP methods

  // 3. Handle OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204); // No Content
    res.end();
    return;
  }

  // 4. Logging (for debugging)
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // Example: [2025-02-01T10:30:00.000Z] GET /COMP4537/labs/3/writeFile/?text=BCIT

  // ===== Routing (URL Pattern Matching) =====

  try {
    // 5-1. C.1 Endpoint: /COMP4537/labs/3/writeFile/
    // Accepts both URL path with / and without /
    if (pathname === '/COMP4537/labs/3/writeFile/' || pathname === '/COMP4537/labs/3/writeFile') {
      
      // Delegate handling to RequestHandler
      await requestHandler.handleWriteRequest(req, res, query);
    } 

    
    // 5-2. C.2 Endpoint: /COMP4537/labs/3/readFile/filename
    else if (pathname.startsWith('/COMP4537/labs/3/readFile/')) {
      
      // Extract filename from URL
      // Example: /COMP4537/labs/3/readFile/file.txt → file.txt
      // split('/COMP4537/labs/3/readFile/') result:
      // ['', 'file.txt']
      //   ↑    ↑
      //  [0]  [1]
      //
      // /COMP4537/labs/3/readFile/ -> stuff in front this chunk is [0], after is [1]
      // [1] → 'file.txt'
      const filename = pathname.split('/COMP4537/labs/3/readFile/')[1];
      
      // Delegate handling to RequestHandler
      await requestHandler.handleReadRequest(req, res, filename);
    } 
    
    // 5-3. Undefined endpoint
    else {
      ResponseFormatter.sendError(
        res, 
        404, 
        'Endpoint not found. Available endpoints:\n' +
        '- /COMP4537/labs/3/writeFile/?text=YourText\n' +
        '- /COMP4537/labs/3/readFile/file.txt'
      );
    }

  } catch (error) {
    // 6. Top-level error handler (catch all exceptions)
    console.error('Unhandled server error:', error);
    
    // Send only generic error message to client (security)
    ResponseFormatter.sendError(
      res, 
      500, 
      'Internal Server Error'
    );
  }
});

// ===== Start Server =====

/**
 * Start server listening
 * Wait for incoming connections on PORT
 */
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log(`📝 Write: http://localhost:${PORT}/COMP4537/labs/3/writeFile/?text=BCIT`);
  console.log(`📖 Read:  http://localhost:${PORT}/COMP4537/labs/3/readFile/file.txt`);
  console.log('='.repeat(50));
});

// ===== Graceful Shutdown =====

/**
 * Handle process termination signals (Ctrl+C)
 * SIGNT -> A termination signal when a user press (Ctrl + C)
 */
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down server gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0); // Normal exit
  });
});

/**
 * Catch unhandled Promise rejections
 * Important for error logging in production
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, send to error monitoring service
});