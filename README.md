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

- Python 3.9 or higher
- Node.js 16 or higher
- npm (comes with Node.js)

### macOS Setup
1. Install Homebrew (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install Python:
```bash
brew install python
```

3. Install Node.js:
```bash
brew install node
```

## Setup

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd tiktok-shazam
```

2. Create and activate a virtual environment:
```bash
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python -m uvicorn app.main:app --reload
```

The backend server will start at `http://localhost:8000`

### Frontend Setup

1. In a new terminal window, navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Click the "Start Recording" button
3. Play the TikTok sound you want to identify
4. Click "Stop Recording" when you're done
5. The app will process the audio and show matching results

## Troubleshooting

### Backend Issues
- If you get "command not found: uvicorn", make sure:
  1. You're in the virtual environment (you should see `(venv)` in your terminal)
  2. The requirements were installed successfully
  3. Try running `pip install uvicorn` directly

### Frontend Issues
- If `npm start` fails:
  1. Make sure you're in the `frontend` directory
  2. Try deleting `node_modules` and running `npm install` again
  3. Check if Node.js is installed correctly with `node --version`

### Common Issues
- If you get permission errors on macOS, you might need to run:
  ```bash
  xcode-select --install
  ```
- If the microphone doesn't work, make sure you've granted browser permissions

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 