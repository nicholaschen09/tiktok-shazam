# TikTok Sound Identifier

This application helps you identify TikTok sounds by recording audio from your microphone and matching it against known TikTok sounds.

## Features

- Record audio from your microphone
- Identify TikTok sounds in real-time
- Display matching results with sound information
- Modern, user-friendly interface

## Tech Stack

- Backend: Python with FastAPI
- Frontend: React with TypeScript
- Audio Processing: librosa
- Database: SQLite (for storing sound fingerprints)

## Prerequisites

- Docker & Docker Compose
- Node.js 16 or higher (for running npm scripts)

## Local Development with Docker Compose

This project uses Docker Compose for local development with hot reload for both backend and frontend.

### 1. Start the full stack
From the `frontend` directory, run:
```bash
npm run docker:up
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

### 2. Stop the stack
From the `frontend` directory, run:
```bash
npm run docker:down
```

### 3. Making Code Changes
- Changes to the backend (`app/`) or frontend (`frontend/`) will hot reload in their respective containers.

## Usage

1. Open `http://localhost:3000` in your browser
2. Click the "Start Recording" button
3. Play the TikTok sound you want to identify
4. Click "Stop Recording" or wait for it to auto-stop
5. The app will process the audio and show matching results

## Troubleshooting

- If you get errors about missing Docker or Docker Compose, make sure they are installed and running.
- If ports 3000 or 8000 are in use, stop other services or update the ports in `docker-compose.yml`.

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 