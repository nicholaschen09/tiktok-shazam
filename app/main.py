from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
from typing import List, Optional
import json
import os
import subprocess

app = FastAPI(title="TikTok Sound Identifier")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

@app.get("/")
async def read_root():
    return {"message": "TikTok Sound Identifier API"}

@app.post("/identify-sound")
async def identify_sound(audio_file: UploadFile = File(...)):
    """
    Process uploaded audio file and attempt to identify the TikTok sound
    """
    # Save the uploaded file temporarily
    file_location = f"uploads/{audio_file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(await audio_file.read())
    
    # Convert webm to wav if needed
    if file_location.endswith('.webm'):
        wav_location = file_location.replace('.webm', '.wav')
        try:
            subprocess.run([
                'ffmpeg', '-y', '-i', file_location, wav_location
            ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            file_to_process = wav_location
        except Exception as e:
            return {"status": "error", "message": f"ffmpeg conversion failed: {str(e)}"}
    else:
        file_to_process = file_location
    
    try:
        # Load and process the audio file
        y, sr = librosa.load(file_to_process)
        
        # Extract audio features
        # 1. Mel-frequency cepstral coefficients (MFCCs)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        
        # 2. Spectral contrast
        contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        
        # 3. Chroma features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        
        # Combine features
        features = {
            "mfccs": mfccs.mean(axis=1).tolist(),
            "contrast": contrast.mean(axis=1).tolist(),
            "chroma": chroma.mean(axis=1).tolist()
        }
        
        # TODO: Implement sound matching logic against database
        # For now, return dummy response
        return {
            "status": "success",
            "message": "Audio processed successfully",
            "features": features,
            "matches": [
                {
                    "id": "1",
                    "name": "Sample TikTok Sound",
                    "confidence": 0.85,
                    "url": "https://example.com/sound1"
                }
            ]
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    finally:
        # Clean up the temporary files
        if os.path.exists(file_location):
            os.remove(file_location)
        if file_location.endswith('.webm') and os.path.exists(wav_location):
            os.remove(wav_location)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 