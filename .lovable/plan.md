

# MongoDB GameDay Trailer — Full Restart (2 Minutes)

## Overview
A 2-minute (120s, 3600 frames at 30fps) cinematic trailer positioning MongoDB GameDay as the go-to hands-on training platform. Uses the previously extracted background music (full length). Features real application screenshots captured from the live preview URL, displayed inside a Chrome browser frame mockup.

## Creative Direction
- **Vibe**: Tech-thriller meets corporate pitch — dark terminal aesthetic, MongoDB green (#00ED64), professional but exciting
- **Palette**: `#00ED64` (MongoDB green), `#061a14` (dark bg), `#E8EDDF` (off-white text), `#1a3d2e` (muted green)
- **Fonts**: Space Grotesk (display), JetBrains Mono (code/terminal)
- **Motion**: Kinetic typography with springs, smooth zoom-and-pan on screenshots, wipe/slide transitions
- **Motifs**: Scanline overlay, terminal cursors, Chrome browser frames around real app pages

## Screenshot Capture Plan
Use Puppeteer to navigate the live preview and screenshot these pages at 1920x1080:
1. **Boot Sequence** — the terminal boot animation
2. **Landing Page** — ASCII art title, mascot, handle input
3. **Dashboard (Grid view)** — mission cards, HUD bar, tier sections
4. **Dashboard (Graph view)** — mission node graph
5. **Mission Briefing** — briefing text, difficulty selector, parameters
6. **Mission Active** — code editor, objectives panel, combo streak
7. **Leaderboard** — podium, rankings table
8. **Profile** — achievements, XP progress, avatar
9. **Quests** — quest chains with progress bars

Each screenshot will be placed inside a styled Chrome browser frame (address bar, traffic lights) to make it look like a real browser window.

## Scene Breakdown (14 scenes, ~120s total)

### Act 1 — The Hook (0-15s)
**Scene 1 (0-4s)**: Dark screen. Terminal cursor blinks. Types: "What if MongoDB training... felt like a heist?" Glitch cut.

**Scene 2 (4-10s)**: The Problem. "Slides don't build muscle memory." / "Docs don't simulate pressure." Stats appear: "67% of SEs want hands-on labs" (stylized). Quick contrast between boring slides and action.

**Scene 3 (10-15s)**: Big reveal. "MongoDB" in glowing green, "HEIST" slams in with spring. Subtitle: "GameDay Edition". Turtle mascot slides in.

### Act 2 — The Platform (15-55s)
**Scene 4 (15-22s)**: Boot sequence screenshot in Chrome frame. Terminal text types out boot lines. Camera slowly zooms in. Caption: "A cinematic onboarding experience."

**Scene 5 (22-30s)**: Landing page screenshot in Chrome frame. Zoom into the ASCII art and mascot. Caption: "Agents pick a handle and enter the grid."

**Scene 6 (30-40s)**: Dashboard screenshot (grid view) in Chrome frame with slow pan across mission cards. Callout labels fly in pointing to tier sections, HUD bar, mission cards. Caption: "25 scenario-based missions across 3 tiers."

**Scene 7 (40-48s)**: Dashboard (graph view) screenshot. Pan across the node graph. Caption: "Visual mission progression with prerequisites."

**Scene 8 (48-58s)**: Mission page (briefing + active editor) screenshots. Show briefing first, then transition to the active editor view. Callout: Monaco editor, objectives panel, chaos events. Caption: "Real MongoDB queries in a live code editor."

### Act 3 — Why It Works (58-85s)
**Scene 9 (58-66s)**: Feature cards fly in (kinetic typography):
- "3 Difficulty Tiers" — Guided → Challenge → Expert
- "Inline Hints" — Learn at your own pace
- "Chaos Events" — Random disruptions test adaptability
- "Sandbox Execution" — Real MongoDB validation

**Scene 10 (66-74s)**: Leaderboard screenshot in Chrome frame. XP counter ticks up. Caption: "Competition drives engagement. Leaderboards, XP, ranks."

**Scene 11 (74-82s)**: Profile + Quests screenshots. Show achievements, quest chains. Caption: "Quest chains map to MongoDB POV capabilities."

**Scene 12 (82-90s)**: The strategic pitch. Clean typography layout:
- Mission names on left → POV capability tags on right
- "CRUD Boot Camp" → "RICH-QUERY"
- "The Aggregation Heist" → "ANALYTICS"
- "Shard Storm" → "SCALABILITY"
Caption: "Every mission maps to a real customer proof point."

### Act 4 — Close (90-120s)
**Scene 13 (90-105s)**: Rapid montage — quick cuts between all screenshots (1-2s each) with energy building. Stats overlay: "25+ Missions • 100+ Objectives • 50+ Chaos Events • 3 Tiers"

**Scene 14 (105-120s)**: Final logo lockup. "MongoDB HEIST" with glow. "GameDay v2.0" subtitle. "Level Up Your Team." Turtle mascot. Fade to dark.

## Technical Approach

1. **Extract full audio** from the YouTube link (starting at 0:25, duration 130s to cover 120s + fade)
2. **Capture 9 screenshots** via Puppeteer from the live preview URL, each at 1920x1080
3. **Build Chrome browser frame component** — reusable wrapper with address bar, traffic light dots, and URL text
4. **Build 14 scene components** under `src/scenes/`
5. **Use TransitionSeries** with wipe/slide transitions between scenes
6. **Persistent layers**: scanline overlay + subtle vignette across all frames
7. **Render with audio** — patch Remotion's audio codec to use `aac` instead of `libfdk_aac`
8. **Output**: `/mnt/documents/heist-trailer-v3.mp4` at 1920x1080, 30fps, ~120s

## Key Component: ChromeFrame
A reusable component that wraps each screenshot in a realistic Chrome browser UI:
- Dark title bar with red/yellow/green dots
- Address bar showing the page URL
- The screenshot as the page content
- Subtle drop shadow and rounded corners

## Deliverable
`heist-trailer-v3.mp4` — 2-minute promotional trailer with background music and real application screenshots in Chrome browser frames.

