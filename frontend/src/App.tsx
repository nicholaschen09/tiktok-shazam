import React, { useState, useRef, useEffect } from 'react';
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
  const [volume, setVolume] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startRecording = async () => {
    try {
      setMatches([]);
      setInfo(null);
      setError(null);
      setVolume(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // --- Sound bar visualizer setup ---
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          // Use average volume
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setVolume(avg);
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
      // --- End sound bar setup ---

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (recordTimeoutRef.current) {
          clearTimeout(recordTimeoutRef.current);
          recordTimeoutRef.current = null;
        }
        // --- Clean up audio context ---
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        setVolume(0);
        // --- End clean up ---
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
        {/* Sound bar visualizer */}
        {isRecording && (
          <div className="sound-bars">
            {[...Array(12)].map((_, i) => {
              // Spread the bars across the volume range
              const barHeight = Math.max(8, (volume / 128) * (20 + i * 6));
              return (
                <div
                  key={i}
                  className="sound-bar"
                  style={{ height: `${barHeight}px` }}
                />
              );
            })}
          </div>
        )}
        {/* End sound bar visualizer */}

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
