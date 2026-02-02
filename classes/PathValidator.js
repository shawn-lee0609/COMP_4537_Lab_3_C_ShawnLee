// classes/PathValidator.js
// Class which is dedicated for managing/validating the path in the URL

/**
 * PathValidator Class
 * Responsibility: Handle security validation for filenames and paths
 * Uses only static methods - utility class with no state
 */
class PathValidator {
  
  /**
   * Validates if a filename is safe and valid
   * @param {string} filename - Filename to validate
   * @returns {boolean} - true if valid, false otherwise
   */
  static isValidFilename(filename) {
    // 1. Check for null, undefined, or empty string
    if (!filename || typeof filename !== 'string') {
      return false; // Invalid if filename is missing or not a string
    }

    // 2. Prevent path traversal attacks (../, ..\, absolute paths, etc.)
    // Blocks hackers trying to access system files like ../../etc/passwd
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return false; // Block attempts to access parent directories
    }

    // 3. Allow only .txt extension (security enhancement)
    if (!filename.endsWith('.txt')) {
      return false; // Block executable files like .exe, .sh
    }

    // 4. Restrict special characters (allow only alphanumeric, hyphen, underscore, dot)
    const validPattern = /^[a-zA-Z0-9_\-\.]+$/;
    if (!validPattern.test(filename)) {
      return false; // Block filenames with special characters
    }

    // All validations passed
    return true;
  }

  /**
   * Safely normalizes a filename
   */
  static sanitizeFilename(filename) {
    // 1. Remove leading and trailing whitespace
    return filename.trim();
  }
}

// Export for use in other files
module.exports = PathValidator;