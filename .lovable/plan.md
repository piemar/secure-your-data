

# MongoDB GameDay — Promotional Trailer Video (Final Plan)

## Summary

A 120-second Remotion-rendered MP4 trailer with **background music extracted from the YouTube video** (audio only, starting at 0:25) and **real app interaction captures** via browser automation. No YouTube video footage is used — only its audio track.

---

## Audio Strategy

The sandbox renders video muted (missing `libfdk_aac`), but we can work around this:

1. **Download** the YouTube video using `yt-dlp`
2. **Extract audio only** starting at 0:25, trimmed to 120 seconds → `/tmp/bg-music.mp3`
3. **Render** the Remotion video muted → `/tmp/gameday-silent.mp4`
4. **Mux** audio + video using `ffmpeg -c:v copy` (no re-encoding needed) → `/mnt/documents/gameday-trailer.mp4`

```text
yt-dlp → extract audio from 0:25 → bg-music.mp3
Remotion render → gameday-silent.mp4 (muted)
ffmpeg -i silent.mp4 -i bg-music.mp3 -c:v copy -c:a aac → final.mp4
```

If `aac` encoding fails due to the sandbox ffmpeg build, we fall back to keeping the MP3 stream as-is (`-c:a copy` with an MKV container, or deliver the MP3 separately for manual muxing).

---

## Visual Capture Strategy

Use browser automation to capture **rapid sequential screenshots** (~80 frames) across 4 user flows from the live preview app. These play as image sequences in Remotion with crossfades and an animated cursor overlay to simulate screen recordings.

### Flows to Capture

| Flow | Screens | ~Frames |
|------|---------|---------|
| A: Onboarding | Boot sequence → handle input → "Jack In" → Dashboard | 15 |
| B: Dashboard | Mission grid → tier browsing → graph view → mission select | 20 |
| C: Mission | Briefing → difficulty select → code editor → validate → celebrate | 30 |
| D: Social | Leaderboard → Profile → achievements | 15 |

---

## Render Strategy (Timeout Mitigation)

The sandbox has a 600-second render limit. A 120-second video at 30fps = 3600 frames, which will exceed this