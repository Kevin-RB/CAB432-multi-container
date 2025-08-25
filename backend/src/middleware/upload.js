import multer from 'multer'
import config from '../config/index.js';

// Configure multer to store files in memory (not on disk)
const storage = multer.memoryStorage();

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
