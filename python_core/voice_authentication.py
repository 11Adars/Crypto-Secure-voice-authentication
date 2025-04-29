import os
import sys
import torch
import torchaudio
import numpy as np
import io
from pathlib import Path
from pydub import AudioSegment
from shutil import copyfile
from speechbrain.inference import SpeakerRecognition
from speechbrain.inference.enhancement import SpectralMaskEnhancement

# Ensures proper UTF-8 output handling
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print("BASE_DIR:", BASE_DIR)
VOICE_SAMPLES_DIR = os.path.join(BASE_DIR, "voice_data")
os.makedirs(VOICE_SAMPLES_DIR, exist_ok=True)

# Load models
model = SpeakerRecognition.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir=os.path.join(BASE_DIR, "pretrained_models/spkrec-ecapa-voxceleb")
)

enhancer = SpectralMaskEnhancement.from_hparams(
    source="speechbrain/metricgan-plus-voicebank",
    savedir=os.path.join(BASE_DIR, "pretrained_models/metricgan-plus-voicebank")
)

# Convert to standard WAV format
def convert_to_wav(input_path):
    try:
        print(f"[DEBUG] Converting file: {input_path}")
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(16000).set_channels(1)

        filename_wo_ext = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(os.path.dirname(input_path), f"{filename_wo_ext}.converted.wav")

        audio.export(output_path, format="wav")
        print(f"[DEBUG] Exported to: {output_path}")
        return output_path
    except Exception as e:
        print(f"[ERROR] Audio conversion failed: {e}")
        sys.exit(1)

# Denoise using SpeechBrain's MetricGAN+ (with Windows-safe workaround)
def denoise_audio(input_path):
    try:
        input_path = os.path.abspath(input_path)
        print(f"[DEBUG] Absolute input path: {input_path}")
        print(f"[DEBUG] BASE_DIR: {BASE_DIR}")

        temp_input_path = os.path.join(BASE_DIR, "temp_input.wav")
        print(f"[DEBUG] Temp input path: {temp_input_path}")

        copyfile(input_path, temp_input_path)

        dir_name = os.path.dirname(input_path)
        filename_wo_ext = os.path.splitext(os.path.basename(input_path))[0]
        enhanced_path = os.path.join(dir_name, f"{filename_wo_ext}_enhanced.wav")

        print(f"[DEBUG] Enhancing: {temp_input_path} -> {enhanced_path}")

        # Change current working directory to BASE_DIR for correct resolution
        cwd = os.getcwd()
        os.chdir(BASE_DIR)

        enhancer.enhance_file("temp_input.wav", enhanced_path)  # now using relative path
        os.chdir(cwd)  # revert to original cwd

        os.remove(temp_input_path)
        return enhanced_path
    except Exception as e:
        print(f"[ERROR] Audio enhancement failed: {e}")
        raise

# Preprocess audio: convert + denoise + load tensor
def preprocess_audio(file_path):
    converted_path = convert_to_wav(file_path)
    enhanced_path = denoise_audio(converted_path)

    signal, sr = torchaudio.load(enhanced_path)
    if sr != 16000:
        signal = torchaudio.transforms.Resample(orig_freq=sr, new_freq=16000)(signal)
    return signal

# Enroll new speaker
def enroll_user(username, file_path):
    try:
        signal = preprocess_audio(file_path)
        embedding = model.encode_batch(signal).detach().squeeze().numpy()

        save_path = os.path.join(VOICE_SAMPLES_DIR, f"{username}.npy")
        np.save(save_path, embedding)

        print(f"[INFO] User '{username}' enrolled successfully.")
    except Exception as e:
        print(f"[ERROR] Enrollment failed: {e}")
        sys.exit(1)

# Authenticate user
def authenticate_user(username, file_path):
    try:
        enrolled_path = os.path.join(VOICE_SAMPLES_DIR, f"{username}.npy")
        if not os.path.exists(enrolled_path):
            print("[INFO] User not enrolled.")
            return False

        enrolled_embedding = np.load(enrolled_path)
        signal = preprocess_audio(file_path)
        current_embedding = model.encode_batch(signal).detach().squeeze().numpy()

        similarity = np.dot(enrolled_embedding, current_embedding) / (
            np.linalg.norm(enrolled_embedding) * np.linalg.norm(current_embedding)
        )
        print(f"[INFO] Cosine Similarity: {similarity:.4f}")

        if similarity > 0.6:
            print("[INFO] Access Granted")
            return True
        else:
            print("[INFO] Access Denied")
            return False
    except Exception as e:
        print(f"[ERROR] Authentication failed: {e}")
        return False

# CLI entry point
if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python voice_authentication.py <enroll/auth> <username> <file_path>")
        sys.exit(1)

    mode, username, file_path = sys.argv[1:]

    if mode == "enroll":
        enroll_user(username, file_path)
        sys.exit(0)
    elif mode == "auth":
        success = authenticate_user(username, file_path)
        sys.exit(0 if success else 1)
    else:
        print("Invalid mode. Use 'enroll' or 'auth'.")
        sys.exit(1)
