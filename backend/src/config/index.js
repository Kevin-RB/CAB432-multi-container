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
      temperature: 0,
      top_k: 1,
      top_p: 1.0,
      repeat_penalty: 1.1
    }
  }
};

export default config;
