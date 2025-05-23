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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await identifySound(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Error accessing microphone. Please ensure you have granted microphone permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const identifySound = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:8000/identify-sound', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMatches(data.matches);
      } else {
        setError(data.message || 'Error identifying sound');
      }
    } catch (err) {
      setError('Error processing audio. Please try again.');
      console.error('Error processing audio:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TikTok Sound Identifier</h1>
        <p>Record audio to identify TikTok sounds</p>
      </header>

      <main>
        <div className="recording-controls">
          <button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

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
