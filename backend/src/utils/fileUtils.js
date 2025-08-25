/**
 * Utility functions for file operations and validation
 */

export const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const isValidMimeType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType);
};

export const sanitizeFilename = (filename) => {
  // Remove potentially dangerous characters
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const generateFileHash = (buffer) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

export default {
  formatFileSize,
  isValidMimeType,
  sanitizeFilename,
  generateFileHash
};
