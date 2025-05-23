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

## Setup

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the backend server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Usage

1. Open the application in your browser
2. Click the "Record" button to start recording audio
3. Play the TikTok sound you want to identify
4. The app will process the audio and show matching results

## Contributing

Feel free to submit issues and enhancement requests! 