# Quantum RPG — Audio Assets

## Ordnerstruktur

```
audio/
├── ambient/     Hintergrund-Loops (60-90s, nahtlos loopbar)
│   ├── space.mp3        Ruhiger Weltraum, Sterne, Drift
│   ├── danger.mp3       Spannend, Bedrohung, nahender Kampf
│   ├── cantina.mp3      Jazzig, entspannt, Mos Eisley Vibes
│   └── mystery.mp3      Unheimlich, Erkundung, verlassene Station
│
├── sfx/         Kurze Sound-Effekte (1-5s)
│   ├── blaster.mp3      Blasterschuss
│   ├── lightsaber.mp3   Lichtschwert-Aktivierung
│   ├── door-open.mp3    Türöffnung (Sci-Fi)
│   └── hyperspace.mp3   Hyperraum-Sprung
│
└── music/       Musik-Stücke (10-60s)
    ├── intro.mp3        Titelmusik / Startbildschirm
    └── victory.mp3      Sieg-Jingle nach bestandener Mission
```

## Technische Anforderungen

- **Format:** MP3 (128-192 kbps) — beste Browser-Kompatibilität
- **Sample Rate:** 44.1 kHz
- **Channels:** Stereo (Ambient/Music), Mono ok für SFX
- **Ambient-Loops:** Nahtloser Loop-Punkt, 60-90 Sekunden
- **SFX:** Kurz und knackig, kein Silence-Padding
- **Musik:** Fade-in/out bereits eingebaut

## Größen-Empfehlung

| Typ     | Dauer   | Zielgröße     |
|---------|---------|---------------|
| Ambient | 60-90s  | 1-3 MB        |
| SFX     | 1-5s    | 50-200 KB     |
| Music   | 10-60s  | 500 KB - 2 MB |

## Lizenz

Alle Audio-Dateien müssen **royalty-free** sein.
Empfohlene Quellen:
- [Pixabay](https://pixabay.com/music/)
- [Freesound](https://freesound.org/)
- [Uppbeat](https://uppbeat.io/)

## Integration

Die Dateien werden automatisch von `src/lib/sounds.ts` geladen.
Volume-Control und Mute-Toggles sind bereits im SystemPanel implementiert.
