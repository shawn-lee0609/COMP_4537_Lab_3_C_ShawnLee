// classes/RequestHandler.js

// Import dependent classes
const ResponseFormatter = require('./ResponseFormatter');
const PathValidator = require('./PathValidator');

/**
 * RequestHandler Class
 * Responsibility: Receive HTTP requests, orchestrate business logic, and generate responses
 * Combines FileManager, PathValidator, and ResponseFormatter
 */
class RequestHandler {
  
  /**
   * Constructor: Dependency Injection
   * @param {FileManager} fileManager - Object responsible for file operations
   */
  constructor(fileManager) {
    // Benefits of dependency injection:
    // 1. Easy to replace with Mock objects during testing
    // 2. No need to modify RequestHandler when FileManager implementation changes
    this.fileManager = fileManager;
  }

  /**
   * C.1 Endpoint Handler: /writeFile/?text=BCIT
   * @param {object} req - HTTP request object
   * @param {object} res - HTTP response object
   * @param {object} queryParams - URL query parameters object
   */
  async handleWriteRequest(req, res, queryParams) {
    try {
      // 1. Extract 'text' from query parameters
      const text = queryParams.text;

      // 2. Return 400 Bad Request if text is missing
      if (!text) {
        ResponseFormatter.sendError(
          res, 
          400, 
          'Bad Request: Missing "text" parameter'
        );
        return; // Exit function
      }

      // 3. Validate filename (file.txt is hardcoded - assignment requirement)
      const filename = 'file.txt';
      
      if (!PathValidator.isValidFilename(filename)) {
        // Send 400 error if validation fails
        ResponseFormatter.sendError(
          res, 
          400, 
          'Invalid filename'
        );
        return;
      }

      // 4. Delegate file writing task to FileManager
      await this.fileManager.appendToFile(filename, text);

      // 5. Send success response
      ResponseFormatter.sendWriteSuccess(res, text);

    } catch (error) {
      // 6. Handle unexpected errors (file system errors, etc.)
      console.error('Error in handleWriteRequest:', error);
      ResponseFormatter.sendError(
        res, 
        500, 
        'Internal Server Error: Could not write to file'
      );
    }
  }

  /**
   * C.2 Endpoint Handler: /readFile/file.txt
   * @param {object} req - HTTP request object
   * @param {object} res - HTTP response object
   * @param {string} filename - Filename extracted from URL
   */
  async handleReadRequest(req, res, filename) {
    try {
      // 1. Return 400 error if filename is missing
      if (!filename) {
        ResponseFormatter.sendError(
          res, 
          400, 
          'Bad Request: No filename provided'
        );
        return;
      }

      // 2. Normalize filename (remove leading/trailing whitespace)
      const sanitizedFilename = PathValidator.sanitizeFilename(filename);

      // 3. Security validation of filename
      if (!PathValidator.isValidFilename(sanitizedFilename)) {
        ResponseFormatter.sendError(
          res, 
          400, 
          'Bad Request: Invalid filename'
        );
        return;
      }

      // 4. Delegate file reading task to FileManager
      const content = await this.fileManager.readFile(sanitizedFilename);

      // 5. Return 404 error if file doesn't exist
      if (content === null) {
        // Assignment requirement: 404 message including filename
        ResponseFormatter.send404(res, sanitizedFilename);
        return;
      }

      // 6. Display file contents in browser (not download)
      ResponseFormatter.sendSuccess(res, content, 'text/plain; charset=utf-8');
      // charset=utf-8 - Correctly display Unicode characters like Korean

    } catch (error) {
      // 7. Handle unexpected errors
      console.error('Error in handleReadRequest:', error);
      ResponseFormatter.sendError(
        res, 
        500, 
        'Internal Server Error: Could not read file'
      );
    }
  }
}

module.exports = RequestHandler;