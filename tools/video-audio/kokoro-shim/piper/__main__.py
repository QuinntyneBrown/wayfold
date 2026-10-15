# Stand-in for `python -m piper -m <voice> -f <out.wav>` (tools/video-audio/generate-audio.mjs,
# piper engine slot): reads text on stdin and writes a WAV with Kokoro ONNX.
# -m is a Kokoro voice name (e.g. af_heart). KOKORO_DIR holds kokoro-v1.0.onnx and voices-v1.0.bin.
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

args = sys.argv[1:]
voice = args[args.index("-m") + 1]
out = args[args.index("-f") + 1]
model_dir = os.environ["KOKORO_DIR"]
speed = float(os.environ.get("KOKORO_SPEED", "1.0"))
text = sys.stdin.buffer.read().decode("utf-8").strip()
kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
samples, rate = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
sf.write(out, samples, rate)
