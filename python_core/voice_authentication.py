import os
import sys
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
import librosa
from pydub import AudioSegment
from sklearn.metrics.pairwise import cosine_similarity

VOICE_SAMPLES_DIR = "voice_data"

# Convert to WAV (forces clean, standard format)
def convert_to_wav(input_path):
    output_path = input_path + ".converted.wav"
    try:
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(output_path, format="wav")
        return output_path
    except Exception as e:
        print(f"[ERROR] Audio conversion failed: {e}")
        sys.exit(1)

def record_voice(filename="temp.wav", duration=5, sr=16000):
    print("[INFO] Recording your voice...")
    audio = sd.rec(int(duration * sr), samplerate=sr, channels=1)
    sd.wait()
    wav.write(filename, sr, audio)
    print(f"[INFO] Saved recording as {filename}")

def extract_features(file_path):
    # Always convert for consistency
    file_path = convert_to_wav(file_path)

    y, sr = librosa.load(file_path, sr=16000)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfcc.T, axis=0).reshape(1, -1)

def enroll_user(username, voice_path):
    os.makedirs(VOICE_SAMPLES_DIR, exist_ok=True)
    features = extract_features(voice_path)
    np.save(os.path.join(VOICE_SAMPLES_DIR, f"{username}.npy"), features)
    print(f"[INFO] Voice enrolled for user: {username}")

def authenticate_user(username, voice_path):
    try:
        enrolled = np.load(os.path.join(VOICE_SAMPLES_DIR, f"{username}.npy"))
        current = extract_features(voice_path)
        similarity = cosine_similarity(enrolled, current)[0][0]
        print(f"[INFO] Similarity Score: {similarity:.2f}")
        if similarity >= 0.99:
            print(" Access Granted")
            return True
        else:
            print("Access Denied")
            return False
    except FileNotFoundError:
        print("[ERROR] User not enrolled.")
        return False
    
if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python voice_authentication.py <mode> <username> <voice_file_path>")
        print("Modes: enroll | auth")
        sys.exit(1)

    mode = sys.argv[1]
    username = sys.argv[2]
    voice_path = sys.argv[3]

    if mode == "enroll":
        enroll_user(username, voice_path)
        sys.exit(0)
    elif mode == "auth":
        success = authenticate_user(username, voice_path)
        if success:
           sys.exit(0)
        else:
           sys.exit(1)

    else:
        print("Invalid mode. Use 'enroll' or 'auth'.")
        sys.exit(1)
