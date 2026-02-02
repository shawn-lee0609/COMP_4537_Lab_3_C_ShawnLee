// classes/ResponseFormatter.js
// Format the response to the client whether it's an error or not.

/**
 * ResponseFormatter Class
 * Responsibility: Standardize HTTP response formatting
 * Manages all response logic in one place
 */
class ResponseFormatter {
  
  /**
   * Sends a success response
   * @param {object} res - Node.js HTTP response object
   * @param {string} data - Data to send to client
   * @param {string} contentType - MIME type (default: text/plain)
   */
  static sendSuccess(res, data, contentType = 'text/plain') {
    // 1. Set HTTP status code 200 (OK)
    // 2. Set Content-Type header (tells browser how to interpret response)
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*' // Allow CORS (access from other domains)
      // If there is no CORS -> Means only the same origin can access
      // If it allows CORS -> All ('*') the other domain have access
    });
    
    // 3. Send response body and close connection
    res.end(data);
  }

  /**
   * Sends a generic error response
   * @param {object} res - HTTP response object
   * @param {number} statusCode - HTTP status code (404, 500, etc.)
   * @param {string} message - Error message
   */
  static sendError(res, statusCode, message) {
    // 1. Set response header with specified status code
    res.writeHead(statusCode, { 
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    
    // 2. Send error message
    res.end(message);
  }

  /**
   * Sends 404 Not Found error (when file doesn't exist)
   * @param {object} res - HTTP response object
   * @param {string} filename - Name of the file that wasn't found
   */
  static send404(res, filename) {
    // Assignment requirement: "404 error message including filename"
    const message = `Error 404: File '${filename}' not found`;
    
    // Reuse sendError method (eliminate code duplication)
    this.sendError(res, 404, message);
  }

  /**
   * Sends file write success message
   * @param {object} res - HTTP response object
   * @param {string} text - Text that was written
   */
  static sendWriteSuccess(res, text) {
    const message = `Successfully appended: "${text}"`;
    this.sendSuccess(res, message);
  }
}

module.exports = ResponseFormatter;