import os
import torch
import torchaudio
import numpy as np
import math
import librosa
from datetime import datetime
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
import logging
import time
import re
import warnings

warnings.filterwarnings("ignore")

# Setup logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Define paths for your model, output directory, and background music directory
config_path = "D:/Renan/new_model/config.json"
checkpoint_dir = "D:/Renan/new_model"
speaker_file_dir = "D:/Renan/Speakers"
output_dir = "D:/Renan/Output"
bg_music_dir = "D:/Renan/RenanPlatform/static/audio/music"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model(config_path, checkpoint_dir):
    """Load the TTS model with given configuration and checkpoint."""
    print("Loading model...")

    # Load model configuration
    config = XttsConfig()
    config.load_json(config_path)

    # Initialize and load the model
    model = Xtts.init_from_config(config)
    model.load_checkpoint(config, checkpoint_dir=checkpoint_dir, use_deepspeed=False)
    model.to(torch.device('cuda'))
    return model

# Load model when the script is first executed
model = load_model(config_path, checkpoint_dir)

def split_text(text, max_chars=200):
    """Split the text into smaller chunks based on character count."""
    sentences = re.split('(?<=[.!?]) +', text)
    chunks = []
    current_chunk = []
    current_chars = 0

    for sentence in sentences:
        sentence_chars = len(sentence)
        if current_chars + sentence_chars > max_chars:
            if current_chunk:
                chunks.append(' '.join(current_chunk))
            current_chunk = [sentence]
            current_chars = sentence_chars
        else:
            current_chunk.append(sentence)
            current_chars += sentence_chars

    if current_chunk:
        chunks.append(' '.join(current_chunk))

    return chunks

def analyze_audio(audio_path):
    """Analyze audio to extract MFCC features."""
    waveform, sr = librosa.load(audio_path, sr=None)
    mfccs = librosa.feature.mfcc(y=waveform, sr=sr, n_mfcc=13)
    mean_mfccs = np.mean(mfccs, axis=1)
    return mean_mfccs

def adjust_parameters(mean_mfccs):
    """Adjust generation parameters based on MFCC analysis."""
    temperature = 0.7
    if np.mean(mean_mfccs) > 0.5:  # Adjust this threshold based on your data
        temperature = 1.2

    return {
        "temperature": temperature,
        "length_penalty": 0.85,
        "repetition_penalty": 2.5,
        "top_k": 65,
        "top_p": 0.95
    }

def add_background_music(speech, bg_music, speech_volume=1.0, music_volume=0.5):
    """Mix background music with speech without fade-in and fade-out effects."""
    if bg_music.shape[1] < speech.shape[1]:
        repeat_times = (speech.shape[1] // bg_music.shape[1]) + 1
        bg_music = torch.cat([bg_music] * repeat_times, dim=1)
    bg_music = bg_music[:, :speech.shape[1]]
    mixed_audio = speech * speech_volume + bg_music * music_volume
    return mixed_audio

def add_silence(audio, silence_length=400):
    silence = torch.zeros((1, silence_length))
    return torch.cat([audio, silence], dim=1)

def apply_window(audio):
    window = np.hanning(audio.shape[1])
    return audio * torch.from_numpy(window).float().unsqueeze(0)

def speed_to_value(speed):
    """Convert speed string to a numeric value."""
    speed_values = {
        'slow': 0.75,
        'normal': 1.0,
        'fast': 1.25
    }
    return speed_values.get(speed, 1.0)  # Default to normal speed if not found

def generate_audio(model, speaker_id, phrases, output_dir, bg_music_filename=None, speed='normal'):
    """Generate audio from text phrases and save it to the specified directory."""
    os.makedirs(output_dir, exist_ok=True)
    
    # Load speaker file based on speaker_id
    speaker_file = os.path.join(speaker_file_dir, f"{speaker_id}.wav")
    
    bg_music = None
    if bg_music_filename:
        bg_music_path = os.path.join(bg_music_dir, f"{bg_music_filename}.wav")
        if os.path.exists(bg_music_path):
            bg_music, _ = torchaudio.load(bg_music_path, normalize=True)
            if bg_music.shape[0] > 1:
                bg_music = bg_music.mean(dim=0, keepdim=True)
        else:
            print(f"Background music file {bg_music_filename} not found, proceeding without background music.")

    print(f"Number of phrases: {len(phrases)}")
    for phrase in phrases:
        chunks = split_text(phrase, max_chars=200)
        combined_audio = []

        for i, chunk in enumerate(chunks):
            start_time = time.time()
            print(f"Processing chunk {i + 1}/{len(chunks)}...")
            print("Computing speaker latents...")
            gpt_cond_latent, speaker_embedding = model.get_conditioning_latents(audio_path=[speaker_file])
            print(f"Inference for chunk {i + 1}/{len(chunks)}...")

            # Convert speed to numeric value
            speed_value = speed_to_value(speed)
            
            # Perform inference with model
            out = model.inference(
                chunk,
                "ar",
                gpt_cond_latent,
                speaker_embedding,
                temperature=0.8,  # Default temperature
                speed=speed_value
            )
            audio_chunk = torch.tensor(out["wav"]).unsqueeze(0)
            audio_chunk = add_silence(audio_chunk)
            combined_audio.append(audio_chunk)
            process_time = time.time() - start_time
            audio_time = len(audio_chunk) / 24000
            logger.info(f"Processing time: {process_time:.3f} seconds")
            logger.info(f"Real-time factor: {process_time / audio_time:.3f}")

        # Combine all audio chunks smoothly
        final_audio = combined_audio[0]
        for i in range(1, len(combined_audio)):
            final_audio = torch.cat([final_audio, combined_audio[i]], dim=1)

        if bg_music is not None:
            final_audio = add_background_music(final_audio, bg_music)
        
        now = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        output_filename = f"{now}-xtts_combined_with_music.wav"
        output_path = os.path.join(output_dir, output_filename)
        
        torchaudio.save(output_path, final_audio, 24000)
        print(f"Generated audio saved to: {output_path}")
