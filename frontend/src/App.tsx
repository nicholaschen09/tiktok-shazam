import React, { useState, useRef } from 'react';
import './App.css';

interface SoundMatch {
  id: string;
  name: string;
  confidence: number;
  url: string;
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [matches, setMatches] = useState<SoundMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setMatches([]);
      setInfo(null);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (recordTimeoutRef.current) {
          clearTimeout(recordTimeoutRef.current);
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await identifySound(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setInfo('Recording... (max 8 seconds, or stop manually)');

      // Automatically stop after 8 seconds
      recordTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 8000);
    } catch (err) {
      setError('Error accessing microphone. Please ensure you have granted microphone permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setInfo(null);
    }
  };

  const identifySound = async (audioBlob: Blob) => {
    try {
      setInfo('Processing audio...');
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:8000/identify-sound', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setInfo(null);
      if (data.status === 'success' && data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setError(null);
      } else {
        setMatches([]);
        setError('No recognizable TikTok sound found. Please try again with a clearer or different sound.');
      }
    } catch (err) {
      setError('Error processing audio. Please try again.');
      setInfo(null);
      console.error('Error processing audio:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shazam but for TikTok Sounds</h1>
        <p>Record audio to identify TikTok sounds</p>
      </header>

      <main>
        <div className="recording-controls">
          <button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={false}
          >
            {isRecording ? (
              <>
                Stop Recording
                <span className="recording-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </>
            ) : (
              'Start Recording'
            )}
          </button>
        </div>

        {info && (
          <div className="info-message">
            {info}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {matches.length > 0 && (
          <div className="results">
            <h2>Matching Sounds</h2>
            <div className="matches-list">
              {matches.map((match) => (
                <div key={match.id} className="match-item">
                  <h3>{match.name}</h3>
                  <p>Confidence: {(match.confidence * 100).toFixed(1)}%</p>
                  <a href={match.url} target="_blank" rel="noopener noreferrer">
                    View Sound
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
