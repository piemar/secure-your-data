

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

The sandbox has a 600-second render limit. A 120-second video at 30fps = 3600 frames, which will exceed this. Solution:

- Render **4 segments** (~30s / 900 frames each)
- Concatenate with `ffmpeg -f concat`
- Mux the background audio onto the joined video

---

## Scene Breakdown (120 seconds)

### Segment 1 — Hook + Problem + Reveal (0–30s)

**Scene 1 (0–8s):** Terminal cursor types: *"Your team knows MongoDB. But can they prove it under pressure?"* Matrix rain texture background. Glitch transition.

**Scene 2 (8–18s):** *"Slides don't build muscle memory. Demos don't test resilience."* Animated stat cards spring in: "25 Missions", "Real MongoDB Queries", "Timed Challenges"

**Scene 3 (18–30s):** Kinetic typography — "MongoDB" glows in `#00ED64`, "GameDay" slams in with spring bounce. Subtitle: "A gamified hands-on training platform". Turtle mascot slides in. Crossfade into **Flow A** footage (boot sequence, handle entry, Jack In).

### Segment 2 — Dashboard Tour + Mission Start (30–60s)

**Scene 4 (30–45s):** **Flow B** footage plays inside a green-bordered browser frame with scanline overlay. Caption cards: "25 Missions Across 3 Tiers", "Visual Node Graph", "Search and Filter"

**Scene 5 (45–60s):** First half of **Flow C** — mission briefing, difficulty selector, code editor appears. Caption: "Guided, Challenge, and Expert Modes"

### Segment 3 — Mission Completion + Chaos (60–90s)

**Scene 6 (60–80s):** Second half of **Flow C** — code validation, green checkmarks, celebration with XP. Caption: "Real-Time Validation Against Live MongoDB"

**Scene 7 (80–90s):** Kinetic typography: *"Chaos Events test resilience under pressure."* Recreated chaos overlay UI mockup in Remotion.

### Segment 4 — Engagement + Why + CTA (90–120s)

**Scene 8 (90–100s):** **Flow D** footage — Leaderboard and Profile with feature cards: "XP and Achievements", "Global Leaderboard", "Quest Chains"

**Scene 9 (100–112s):** Mission-to-POV mapping layout. Mission names on left, capability tags on right (CRUD → RICH-QUERY, Aggregation → ANALYTICS, Sharding → SCALABILITY, Encryption → SECURITY, Vector Search → AI). Animated connecting lines.

**Scene 10 (112–120s):** Final lockup — "MongoDB GameDay" + turtle mascot + "Level Up Your Team". Green glow pulses, hard cut to black.

---

## Creative Direction

- **Palette**: MongoDB Green `#00ED64`, Terminal Dark `#061a14`, Off-white `#E8EDDF`, Muted Green `#1a3d2e`
- **Fonts**: Space Grotesk (headers) + JetBrains Mono (code/terminal)
- **Motion**: Snappy springs for text, wipe/fade transitions between scenes, Ken Burns zoom on app footage
- **Motifs**: Green-glowing browser frame around all captured footage, scanline overlay, terminal cursor on typography scenes
- **Video treatment**: All app captures shown inside styled "browser chrome" with rounded corners and green glow — never raw fullscreen

---

## Music Timing Guide

Since the audio is extracted from a single source track, these cues help align visual beats with the music:

| Timecode | Scene | Visual Energy |
|----------|-------|---------------|
| 0:00–0:08 | Hook | Low — tension building |
| 0:08–0:18 | Problem | Rising — stats fly in |
| 0:18–0:30 | Reveal | Peak — brand slam, mascot entry |
| 0:30–0:60 | Product tour | Driving — continuous footage |
| 0:60–0:90 | Mission + Chaos | High energy — validation, chaos |
| 0:90–1:12 | Features + Mapping | Resolving — confident |
| 1:12–2:00 | CTA | Clean ending — logo hit |

If the extracted audio doesn't naturally align, we can trim or fade sections with ffmpeg filters.

---

## Build Steps

1. Download YouTube audio via `yt-dlp`, extract from 0:25, trim to 120s
2. Capture ~80 sequential screenshots from the live app via browser automation
3. Scaffold Remotion project at `/tmp/gameday-trailer/`
4. Build 10 scene components with kinetic typography + image sequence playback
5. Render 4 segments (~900 frames each)
6. Concatenate segments with `ffmpeg -f concat`
7. Mux background audio onto the silent video
8. Output: `/mnt/documents/gameday-trailer.mp4` — 120s, 1920x1080, 30fps, with audio

## Deliverable

`/mnt/documents/gameday-trailer.mp4` — 120 seconds, 1920x1080, 30fps, **with background music**

