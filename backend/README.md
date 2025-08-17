# CAB432-backend
backend for CAB432 unit

## Getting Started

### Running Locally
```bash
npm install
npm start
```

### Running with Docker

#### Build the Docker image:
```bash
docker build -t cab432-backend .
```

#### Run the container:
```bash
docker run -p 3000:3000 cab432-backend
```

#### Run with volume mount for uploads (optional):
```bash
docker run -p 3000:3000 -v $(pwd)/uploads:/app/uploads cab432-backend
```

The application will be available at `http://localhost:3000`

## API Endpoints

- `POST /upload` - Upload files endpoint
