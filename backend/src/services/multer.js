import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
console.log('Current working directory:', process.cwd());
console.log('Upload directory path:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created successfully');
} else {
  console.log('Uploads directory already exists');
}

/**
 * Generate a unique filename with timestamp prefix
 * @param {string} originalName - Original filename
 * @returns {string} - Sanitized unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}-${sanitizedName}`;
};

/**
 * Safely delete a file if it exists
 * @param {string} filePath - Path to the file to delete
 */
export const cleanupFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to cleanup file ${filePath}:`, error.message);
  }
};

/**
 * Get file information object from multer file
 * @param {Object} file - Multer file object
 * @returns {Object} - Formatted file information
 */
export const getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    savedAs: file.filename,
    filePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
    uploadTime: new Date().toISOString()
  };
};

/**
 * Read file buffer from disk
 * @param {string} filePath - Path to the file
 * @returns {Buffer} - File buffer
 */
export const readFileBuffer = (filePath) => {
  return fs.readFileSync(filePath);
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination callback - uploadsDir:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    console.log('Multer filename callback - original:', file.originalname, 'unique:', uniqueName);
    cb(null, uniqueName);
  }
});

// Export configured multer instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Accept only configured file types
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${config.upload.allowedMimeTypes.join(', ')} files are allowed.`));
    }
  }
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `File size must be less than ${config.upload.maxFileSize / (1024 * 1024)}MB`
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
};

export default {
  upload,
  handleUploadError,
  generateUniqueFilename,
  cleanupFile,
  getFileInfo,
  readFileBuffer
};
