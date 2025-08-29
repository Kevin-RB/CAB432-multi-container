# Multi-Container Application

A containerized application with frontend, backend, and OCR services.

## Prerequisites

- Docker Desktop (preferably installed)

## How to Run

1. Locate to the root of the project
2. Run the following command:

```bash
docker compose up -d --build
```

## How it Works

The application will expose 2 ports for your local preview:

- **:3000** - API backend
- **:3001** - Frontend application

## How to Log In

There are 2 hardcoded users for the time being, they have different roles and functionalities.

**⚠️ Login as admin to access full application functionality**

### Admin User
- **Username:** `admin`
- **Password:** `admin`

### Regular User
- **Username:** `CAB432`
- **Password:** `supersecret`

## Caveats

This project uses YouTube API to show videos based on recipes suggested by an LLM model. For this to work you need to:

1. Create a `.env` file in the `frontend` directory
2. Add your YouTube API key:

```properties
VITE_YOUTUBE_API_KEY={your_key}
```

## Support

Reach out to me if you encounter any issues running the project!
