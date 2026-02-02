// classes/FileManager.js

// Import Node.js built-in modules
const fs = require('fs').promises; // Promise-based file system API (enables async/await)
                                   // Since it's promise-based, we are able to use aync/await

const path = require('path');      // Path manipulation utilities

/**
 * FileManager Class
 * Responsibility: Encapsulate file system operations (read, write, check existence)
 * Applies Single Responsibility Principle -> Only manages file operation
 * Which is related to "Files"
 */
class FileManager {
  
  /**
   * Constructor: Initialize FileManager instance
   * @param {string} baseDir - Base directory path for storing files
   */
  constructor(baseDir) {
    this.baseDir = baseDir; // Root directory for all file operations
    // Gets the path from "server.js" line 28
  }

  /**
   * Private method to generate full path from filename (e.g. file.txt)
   * @param {string} filename - Filename
   * @returns {string} - Absolute path
   */
  _getFullPath(filename) {
    // Use path.join() to automatically handle OS-specific path separators
    // Example: Windows uses \, Linux/Mac use /
    return path.join(this.baseDir, filename);
  }

  /**
   * C.1 Implementation: Append text to file
   * @param {string} filename - Target filename
   * @param {string} text - Text to append
   * @returns {Promise<void>} - Promise indicating operation completion
   */
  async appendToFile(filename, text) {
    // 1. Generate full path to the specific file 
    // ex. '/home/user/Lab3/files/file.txt'
    const fullPath = this._getFullPath(filename);

    try {
      // 2. Check if directory exists if not generates one
      await fs.mkdir(this.baseDir, { recursive: true });
      // recursive: true - Auto-create intermediate directories (like mkdir -p)
      // No error thrown if directory already exists

      // 3. Append text to file (auto-create file if doesn't exist)
      await fs.appendFile(fullPath, text + '\n', 'utf8');
      // text + '\n' - Separate each line with newline so it shows one text in one line (UI)
      // 'utf8' - Specify text encoding

      // 4. Successfully completed, return nothing
    } catch (error) {
      // 5. Propagate error to caller if occurs
      console.error('Error appending to file:', error);
      throw error; // Delegate handling to RequestHandler
    }
  }

  /**
   * C.2 Implementation: Read file contents
   * @param {string} filename - Filename to read
   * @returns {Promise<string|null>} - File contents or null (file doesn't exist)
   */
  async readFile(filename) {
    // 1. Generate full path
    const fullPath = this._getFullPath(filename);

    try {
      // 2. Check file existence first
      const exists = await this.fileExists(filename);
      
      if (!exists) {
        // 3. Return null if file doesn't exist (not an error)
        return null;
      }

      // 4. Read file contents
      const content = await fs.readFile(fullPath, 'utf8');
      // 'utf8' - Read as text, not binary
      
      // 5. Return contents
      return content;

    } catch (error) {
      // 6. Error during reading (permission issues, etc.)
      console.error('Error reading file:', error);
      throw error;
    }
  }

  /**
   * Helper method to check if file exists
   * @param {string} filename - Filename to check
   * @returns {Promise<boolean>} - true if exists, false otherwise
   */
  async fileExists(filename) {
    const fullPath = this._getFullPath(filename);

    try {
      // fs.access() - Check if file is accessible
      await fs.access(fullPath);
      return true; // Accessible = file exists
    } catch {
      // Don't use error in catch (non-existence is normal)
      return false; // Not accessible = file doesn't exist
    }
  }
}

module.exports = FileManager;