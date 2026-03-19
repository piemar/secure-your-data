

# MongoDB GameDay Trailer — 2 Minutes with Fresh Audio & Callout Annotations

## Key Clarification: Fresh Audio Extraction
Extract audio **fresh** from the original YouTube source `https://youtu.be/0vPt7GI-2kc?si=Gix_TwmckK0m3SZJ` starting at exactly **00:25**, pulling **120 seconds** of audio. Do NOT reuse any previously extracted file.

```text
yt-dlp → full audio → ffmpeg -ss 25 -t 120 → fade in/out → heist-bg-120s.mp3
```

## Overview
- **Duration**: 120s (3600 frames at 30fps)
- **Output**: `/mnt/documents/heist-trailer-v3.mp4` (1920x1080, H.264 + AAC)
- **Audio**: 120s background music from YouTube source, freshly extracted
- **Visual**: Real app screenshots in Chrome browser frames with animated callout annotations

---

## Step 1 — Extract Audio (Fresh from YouTube)

Download audio from `https://youtu.be/0vPt7GI-2kc?si=Gix_TwmckK0m3SZJ` using `yt-dlp`. Then use `ffmpeg` to trim starting at 00:25 for exactly 120 seconds, with 2s fade-in and 5s fade-out. Copy result to the Remotion project's `public/audio/` directory.

## Step 2 — Capture 9 Screenshots via Browser Tool

Navigate the live preview app and capture these pages at 1920x1080. Save each as base64, then write to the Remotion project's `public/images/`:

1. **Boot Sequence** (`/`) — terminal boot animation
2. **Landing Page** (`/`) — ASCII art, mascot, handle input
3. **Dashboard Grid** (`/dashboard`) — mission cards, HUD bar, tiers
4. **Dashboard Graph** (`/dashboard`) — toggle to graph view, node graph
5. **Mission Briefing** (`/mission/crud-boot-camp`) — briefing text, difficulty selector
6. **Mission Active** (`/mission/crud-boot-camp`) — code editor, objectives, combo streak
7. **Leaderboard** (`/leaderboard`) — podium, rankings
8. **Profile** (`/profile`) — achievements, XP, avatar
9. **Quests** (`/quests`) — quest chains, progress bars

## Step 3 — Scaffold Remotion Project

Set up `/tmp/heist-video-v3` with Remotion, React, TailwindCSS. Install deps via `bun`. Patch compositor (musl→gnu), symlink ffmpeg/ffprobe. Load fonts: Space Grotesk (display) + JetBrains Mono (code).

## Step 4 — Build Components

### ChromeFrame Component
Reusable wrapper rendering a dark Chrome browser UI:
- Title bar with red/yellow/green traffic light dots
- Address bar with URL text
- Screenshot as page content
- Subtle rounded corners and drop shadow

### CalloutAnnotation Component
Animated annotation arrows/labels that fly in and point to specific UI features:
- Takes `label`, `x`, `y`, `angle`, `delay` props
- Uses `spring()` for entrance (scale + opacity)
- Renders a colored line/arrow + rounded label badge
- Glow effect on the label in MongoDB green

### Per-Screenshot Callout Map

| Screenshot | Callouts |
|---|---|
| Dashboard Grid | "HUD Bar" → top bar, "Mission Cards" → card grid, "Tier Sections" → tier headers |
| Dashboard Graph | "Node Graph" → center, "Prerequisites" → connecting lines |
| Mission Briefing | "Difficulty Selector" → selector area, "Mission Intel" → briefing text |
| Mission Active | "Monaco Editor" → code panel, "Objectives Panel" → right side, "Chaos Events" → overlay area |
| Leaderboard | "XP Rankings" → table, "Podium" → top 3 |
| Profile | "Achievements" → badges area, "XP Progress" → progress bar |
| Quests | "Quest Chains" → quest list, "Progress Tracking" → progress bars |

## Step 5 — Build 14 Scene Components

### Act 1 — The Hook (0-15s)
- **Scene 1 (0-4s)**: Terminal cursor types "What if MongoDB training... felt like a heist?" Glitch cut.
- **Scene 2 (4-10s)**: Problem statement. "Slides don't build muscle memory." Stats fly in.
- **Scene 3 (10-15s)**: Logo reveal. "MongoDB HEIST" with spring slam + glow. Mascot slides in.

### Act 2 — The Platform (15-55s)
- **Scene 4 (15-22s)**: Boot screenshot in ChromeFrame. Slow zoom. Caption below.
- **Scene 5 (22-30s)**: Landing page in ChromeFrame. Zoom into ASCII art.
- **Scene 6 (30-40s)**: Dashboard grid in ChromeFrame. Slow pan. **Callouts animate in**: "HUD Bar", "Mission Cards", "Tier Sections".
- **Scene 7 (40-48s)**: Dashboard graph in ChromeFrame. **Callouts**: "Node Graph", "Prerequisites".
- **Scene 8 (48-58s)**: Mission briefing → active editor transition in ChromeFrame. **Callouts**: "Monaco Editor", "Objectives Panel", "Difficulty Selector".

### Act 3 — Why It Works (58-85s)
- **Scene 9 (58-66s)**: Kinetic typography feature cards: "3 Difficulty Tiers", "Inline Hints", "Chaos Events", "Sandbox Execution".
- **Scene 10 (66-74s)**: Leaderboard in ChromeFrame. **Callouts**: "XP Rankings", "Podium".
- **Scene 11 (74-82s)**: Profile + Quests in ChromeFrame. **Callouts**: "Achievements", "Quest Chains".
- **Scene 12 (82-90s)**: Strategic pitch typography. Mission names → POV capability tags.

### Act 4 — Close (90-120s)
- **Scene 13 (90-105s)**: Rapid montage of all screenshots (1-2s each). Stats overlay.
- **Scene 14 (105-120s)**: Final logo lockup. "MongoDB HEIST — GameDay v2.0". "Level Up Your Team." Fade.

## Step 6 — Wire Together & Render

- Use `TransitionSeries` with wipe/slide transitions between scenes
- Persistent scanline overlay across all frames
- Audio track via `<Audio src={staticFile('audio/bg-music.mp3')} />`
- Render with programmatic script (`scripts/render.mjs`) — patch audio codec to `aac`, use `chromeMode: "chrome-for-testing"`, `concurrency: 1`
- Output to `/mnt/documents/heist-trailer-v3.mp4`

## Rendering Note: Audio
Since Nix ffmpeg lacks `libfdk_aac`, patch Remotion's audio codec config to use built-in `aac` encoder. Set `muted: false` in render script but patch the codec mapping.

