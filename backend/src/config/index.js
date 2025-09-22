import { secret } from "../utils/jwt-utils.js";

export const config = {
  port: process.env.PORT || 3000,
  services: {
    ollama: {
      baseUrl: process.env.OLLAMA_URL || 'http://ollama:11434'
    },
    tesseract: {
      baseUrl: process.env.TESSERACT_URL || 'http://tesseract:3001'
    }
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ]
  },
  ollama: {
    model: 'gemma3:1b',
    options: {
      deterministic: {
        temperature: 0,
        top_k: 1,
        top_p: 1.0,
        repeat_penalty: 1.1
      },
      creative: {
        temperature: 0.7,
        top_k: 40,
        top_p: 0.9,
      }
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || secret,
    expiresIn: '30m'
  },
  aws:{
    s3BucketName: process.env.AWS_S3_BUCKET_NAME
  }
};

export default config;
