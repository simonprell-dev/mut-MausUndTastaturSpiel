"""Erzeugt Klammis Sprachaufnahmen mit dem freien Sprachmodell Piper.

Liest alle Dialogzeilen aus js/scenes*.js, spricht jede einmal ein und legt sie als MP3 in audio/ ab.
Dazu entsteht js/voice-lines.js mit der Zuordnung Text -> Datei. Schon vorhandene Aufnahmen werden
nicht neu erzeugt, veraltete werden gelöscht.

Einmalige Vorbereitung:
    pip install piper-tts
    python -m piper.download_voices de_DE-thorsten-high      (lädt die Stimme, ca. 110 MB)
    ffmpeg muss installiert sein

Aufruf (im Projektordner):
    python tools/make-voice.py --model PFAD/de_DE-thorsten-high.onnx
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"

# Klang je Figur: pitch = Tonhöhe (1.0 = unverändert), speed = Sprechtempo des Modells (kleiner = schneller)
FIGURES = {
    "k": {"pitch": 1.22, "speed": 0.92},   # Klammi: etwas höher und flotter, wie eine Trickfigur
    "v": {"pitch": 0.80, "speed": 1.05},   # Virus: tiefer und langsamer
}
VERSION = "1"  # hochzählen, um alle Aufnahmen neu zu erzeugen

# Aussprache-Hilfen: nur das Gesprochene ändert sich, nicht der Text in der Sprechblase.
SAY_AS = [
    (r"\bUps\b", "Hoppla"),
    (r"\bMmpf\b", "Umpf"),
    (r"\bMuahaha\b", "Mua ha ha ha"),
    (r"\bKn…", "Knopf"),
    (r"\bStrg\b", "Steuerung"),
    (r"(?i)\.EXE\b", " Punkt E X E"),
    (r"\bOS\b", "O S"),
    (r"\?!", "?"),
    (r"^\s*…\s*", ""),
    (r"\s*…\s*$", "."),
    (r"\s*…\s*", ", "),
    (r"[„“”]", ""),
]


def spoken(text: str) -> str:
    """Macht aus dem Sprechblasentext das, was die Stimme vorlesen soll."""
    s = text
    for pattern, to in SAY_AS:
        s = re.sub(pattern, to, s)
    s = re.sub(r"([A-Za-zÄÖÜäöü])\1{2,}", r"\1", s)                      # "Pssst" -> "Pst"
    s = re.sub(r"[A-ZÄÖÜ]{2,}", lambda m: m.group(0)[0] + m.group(0)[1:].lower(), s)  # nicht buchstabieren
    return re.sub(r"\s+", " ", s).strip()


def collect():
    """Alle Dialogzeilen: say('...'), wrong('...') und V('...') gehören Klammi, vsay('...') und VV('...') dem Virus."""
    lines = {}
    pattern = re.compile(r"\b(vsay|say|wrong|VV|V)\('((?:[^'\\]|\\.)*)'")
    for f in sorted((ROOT / "js").glob("scenes*.js")):
        for kind, raw in pattern.findall(f.read_text(encoding="utf-8")):
            text = raw.replace("\\'", "'")
            if not text.strip():
                continue
            who = "v" if kind in ("vsay", "VV") else "k"
            lines[(who, text)] = True
    return list(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="Pfad zur Piper-Stimme (.onnx)")
    ap.add_argument("--list", action="store_true", help="nur anzeigen, was gesprochen würde")
    args = ap.parse_args()

    lines = collect()
    if args.list:
        for who, text in lines:
            print(who, "|", spoken(text))
        print(len(lines), "Zeilen")
        return

    from piper import PiperVoice, SynthesisConfig
    voice = PiperVoice.load(args.model)
    rate = voice.config.sample_rate
    model_name = Path(args.model).stem
    AUDIO.mkdir(exist_ok=True)
    manifest, made = {}, 0

    for who, text in lines:
        fig = FIGURES[who]
        say = spoken(text)
        key = hashlib.sha1(f"{VERSION}|{model_name}|{who}|{fig}|{say}".encode("utf-8")).hexdigest()[:12]
        name = f"{who}-{key}.mp3"
        # Schlüssel wie im Spiel: Auslassungszeichen werden dort zu drei Punkten
        manifest[f"{who}|{text.replace('…', '...')}"] = name
        out = AUDIO / name
        if out.exists():
            continue
        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "line.wav"
            with wave.open(str(wav), "wb") as w:
                voice.synthesize_wav(say, w, syn_config=SynthesisConfig(length_scale=fig["speed"]))
            p = fig["pitch"]
            # Tonhöhe ändern, Tempo beibehalten; Lautstärke angleichen; Stille am Rand kürzen
            flt = (f"asetrate={int(rate * p)},aresample=44100,atempo={1 / p:.4f},"
                   "silenceremove=start_periods=1:start_threshold=-50dB,"
                   "loudnorm=I=-18:TP=-2:LRA=11,apad=pad_dur=0.12")
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-af", flt,
                            "-ac", "1", "-ar", "44100", "-b:a", "64k", str(out)], check=True)
        made += 1
        print(f"[{made}] {name}  {say}")

    keep = set(manifest.values())
    removed = 0
    for f in AUDIO.glob("*.mp3"):
        if f.name not in keep:
            f.unlink()
            removed += 1

    js = ("'use strict';\n// Automatisch erzeugt von tools/make-voice.py – nicht von Hand ändern.\n"
          "const VOICE_LINES = " + json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True) + ";\n")
    (ROOT / "js" / "voice-lines.js").write_text(js, encoding="utf-8", newline="\n")
    size = sum(f.stat().st_size for f in AUDIO.glob("*.mp3"))
    print(f"{len(manifest)} Zeilen, {made} neu, {removed} gelöscht, {size / 1e6:.1f} MB in audio/")


if __name__ == "__main__":
    sys.exit(main())
