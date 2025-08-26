# Receipt Processing Application

A multi-service containerized application for processing receipts using OCR and AI technologies.

## 🏗️ Architecture

- **Frontend**: React + TypeScript with TanStack Router
- **Backend**: Node.js API server  
- **Tesseract OCR**: Image text extraction service
- **Ollama**: AI processing with Gemma2 model

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Git

### Running the Application

```bash
# Clone the repository
git clone https://github.com/Kevin-RB/CAB432-multi-container.git
cd cloud-computing

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# Ollama: http://localhost:11434
```

### Development Mode with Hot Reload

```bash
# Start with file watching for development
docker-compose up --build --watch
```

## 📁 Project Structure

```
cloud-computing/
├── CAB-frontend/          # React frontend application
├── backend/               # Node.js API server
├── tesseract-ocr/         # OCR processing service
├── docker-compose.yml     # Multi-service orchestration
└── README.md             # This file
```

## 🛠️ Development

Each service has its own README with specific development instructions:

- [Frontend Development](./CAB-frontend/README.md)
- [Backend Development](./backend/README.md)

### Individual Service Development

```bash
# Frontend only
cd CAB-frontend
npm install
npm run dev

# Backend only  
cd backend
npm install
npm run dev
```

## 🔧 Services Overview

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3001 | React application UI |
| Backend | 3000 | REST API server |
| Tesseract | - | OCR text extraction |
| Ollama | 11434 | AI model inference |

## 📝 API Documentation

The backend API provides endpoints for:
- Receipt upload and processing
- OCR text extraction
- AI-powered data analysis

See [Backend Documentation](./backend/README.md) for detailed API reference.

## 🐳 Docker Services

### Frontend Service
- **Framework**: Vite + React + TypeScript
- **Port**: 3001 (external) → 3000 (internal)
- **Features**: Hot reload, TanStack Router, Tailwind CSS

### Backend Service
- **Framework**: Node.js + Express
- **Port**: 3000
- **Features**: REST API, File upload, JWT authentication

### Tesseract OCR Service
- **Framework**: Python + Flask
- **Features**: Image text extraction, Receipt processing

### Ollama Service
- **Model**: Gemma2 1B
- **Port**: 11434
- **Features**: AI text processing and analysis

## 🚢 Deployment

The application is containerized and ready for deployment to any Docker-compatible platform:

- Docker Compose (development)
- Kubernetes (production)
- Cloud platforms (AWS ECS, Google Cloud Run, etc.)

## 🔧 Configuration

### Environment Variables

Create `.env` files in each service directory as needed:

```bash
# backend/.env
PORT=3000
JWT_SECRET=your-secret-key
OLLAMA_URL=http://ollama:11434
TESSERACT_URL=http://tesseract:5000

# CAB-frontend/.env (if needed)
VITE_API_URL=http://api:3000
VITE_ENVIRONMENT=docker
```

## 🧪 Testing

```bash
# Test all services
docker-compose up --build

# Test individual services
cd CAB-frontend && npm test
cd backend && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test with `docker-compose up --build`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, and 11434 are available
2. **Docker issues**: Restart Docker Desktop and try again
3. **Frontend not accessible**: Check that Vite is configured with `host: '0.0.0.0'`
4. **API connection issues**: Verify service names in docker-compose.yml

### Getting Help

- Check the logs: `docker-compose logs <service-name>`
- Restart services: `docker-compose restart`
- Rebuild containers: `docker-compose up --build --force-recreate`

---

**Built with ❤️ for CAB432 Cloud Computing**
