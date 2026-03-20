

# MongoDB GameDay — Revised Trailer Plan (Two Versions)

## Two Deliverables

1. **Short Cut (30s)** — `/mnt/documents/gameday-trailer-short.mp4` — Social media (LinkedIn, Twitter/X)
2. **Full Cut (120s)** — `/mnt/documents/gameday-trailer.mp4` — Presentations, email campaigns, event pages

Both share the same Remotion project, audio track, and captured assets. The short cut is a dedicated 30-second composition, not just a trimmed version.

---

## Core Fix: Real App Content via Browser Capture

The previous trailer used CSS-recreated mockups. This version captures **~100 sequential screenshots** from the live app at 1920x1080, showing real user flows. Screenshots play as image sequences in Remotion with crossfade and Ken Burns zoom effects.

### Capture Flows

| Flow | Route | What We Capture | ~Frames |
|------|-------|-----------------|---------|
| A: Boot + Landing | `/` | Boot sequence text scrolling, ASCII art, mascot appearing, handle input field, "CONNECT" button | 15 |
| B: Dashboard | `/dashboard` | HUD bar with XP/level, mission grid with TiltCards, tier tabs (Recon/Infiltration/Exfiltration), node graph view, mission search | 25 |
| C: Mission Active | `/mission/mission-12` | Briefing typewriter text, difficulty selector panel, **code editor with real MongoDB code** (`insertOne`, `find`, `updateOne`), objectives panel with checkmarks, VALIDATE button being clicked, green validation feedback, celebration screen with XP earned | 35 |
| D: Social | `/leaderboard`, `/profile` | Leaderboard rankings table, profile page with achievements, quest chains | 15 |

**Critical addition**: Flow C now explicitly captures the **code editor in action** — showing typed MongoDB queries, the objectives panel updating, and the validation/celebration sequence. This is the "wow" moment.

---

## Mascot Strategy: Large + Persistent

Both mascot images (`heist-mascot.png` and `heist-mascot-celebrate.png`) appear at 250px-500px scale with spring-physics animations:

- **Every scene** has the mascot present as an overlay layer
- Scene 1 (Hook): 350px, center, "hacking" alongside terminal text
- Scene 3 (Reveal): 400px, slides in with brand slam, spring bounce
- Scenes 4-6 (App tour): 200px in corner, bouncing/reacting
- Scene 6 (Celebration): Switches to `heist-mascot-celebrate.png` at 350px
- Scene 10 (CTA): 500px center, celebrating pose, confetti burst
- Short cut: Mascot in every scene at 300px+

---

## Full Cut Scene Breakdown (120s, 3600 frames)

### Segment 1 — Hook + Reveal (0-30s)
- **Scene 1 (0-8s)**: Large mascot (350px) + terminal typewriter: "Your team knows MongoDB. But can they prove it under pressure?"
- **Scene 2 (8-18s)**: Stat cards spring in around mascot: "25 Missions", "Real MongoDB Queries", "Timed Challenges"
- **Scene 3 (18-30s)**: "MongoDB GameDay" kinetic slam, mascot (400px) bounces in. Crossfade into **real boot sequence screenshots** (Flow A)

### Segment 2 — Dashboard + Mission Start (30-60s)
- **Scene 4 (30-42s)**: **Flow A+B screenshots** — real landing page, dashboard with mission grid, HUD bar. Green browser frame. Mascot in corner.
- **Scene 5 (42-60s)**: **Flow C first half** — mission briefing with typewriter text, difficulty selector, code editor appearing with real MongoDB skeleton code. Caption: "Guided, Challenge, and Expert Modes". Mascot pointing at editor.

### Segment 3 — Code Editor + Validation + Chaos (60-90s)
- **Scene 6 (60-75s)**: **Flow C second half** — code editor with filled-in MongoDB queries (`db.collection.insertOne(...)`, `db.collection.find(...)`), VALIDATE button click, green checkmarks on objectives, celebration screen with XP. Mascot switches to celebrate pose (350px).
- **Scene 7 (75-90s)**: Kinetic typography: "Chaos Events test resilience." Mascot shaking. Quick montage of app chaos overlay + timer counting down.

### Segment 4 — Social + CTA (90-120s)
- **Scene 8 (90-100s)**: **Flow D screenshots** — leaderboard with rankings, profile achievements. Mascot pointing at #1 rank.
- **Scene 9 (100-112s)**: Mission-to-capability mapping (CRUD → RICH-QUERY, Aggregation → ANALYTICS, etc.) with animated connecting lines.
- **Scene 10 (112-120s)**: Giant mascot (500px) center, celebrate pose, confetti. "MongoDB GameDay — Level Up Your Team". Hard cut to black.

---

## Short Cut Scene Breakdown (30s, 900 frames)

Designed for maximum impact in social media scroll:

- **0-5s**: Large mascot (400px) + "Can your team prove they know MongoDB?" quick type
- **5-12s**: Rapid montage of **real app screenshots** — boot sequence, dashboard grid, mission cards flying by. Fast crossfades (8-frame transitions).
- **12-22s**: **Code editor hero moment** — real screenshots showing MongoDB code being written, VALIDATE click, green checkmarks cascading, celebration XP screen. Mascot celebrates at 350px.
- **22-28s**: Quick leaderboard flash + feature stat cards
- **28-30s**: "MongoDB GameDay" logo + mascot (500px) + "Level Up Your Team". Hard cut.

---

## Audio

Same strategy for both versions:
- Extract from YouTube (`0:25`) — 120s for full cut, 30s for short cut
- Mux onto silent renders via `ffmpeg -c:v copy -c:a copy`

## Render Plan

- **Full cut**: 4 segments x 900 frames, concatenate, mux audio
- **Short cut**: Single render (900 frames, well within 600s timeout), mux audio

## Build Steps

1. Extract YouTube audio — 120s version and 30s version
2. Capture ~100 screenshots from live app via browser automation (all 4 flows)
3. Copy screenshots + both mascot images into Remotion project `public/`
4. Build scene components using real screenshot image sequences + large mascot overlays
5. Register two compositions: `main` (3600 frames) and `short` (900 frames)
6. Render full cut in 4 segments, concatenate
7. Render short cut in single pass
8. Mux audio onto both
9. Deliver both to `/mnt/documents/`

## Deliverables

- `/mnt/documents/gameday-trailer.mp4` — 120s full cut with audio
- `/mnt/documents/gameday-trailer-short.mp4` — 30s social cut with audio

