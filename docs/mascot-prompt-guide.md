# MongoDB Data Heist — Mascot Prompt Guide

Use these prompts to generate consistent raccoon mascot variants for the MongoDB Data Heist game. All prompts are designed for image generation tools (Midjourney, DALL-E, Stable Diffusion, Gemini, etc.).

---

## Base Character Description

> **Chibi/pixel-art raccoon character with a black burglar mask over its eyes, bright green glowing eyes, wearing a dark hoodie. The raccoon is holding a small glowing green data crystal/gem. Transparent background, cute cartoon style, game mascot aesthetic, clean lines, limited color palette (black, grey, green glow).**

---

## Pose Variants

### 1. Idle / Default
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes, standing casually holding a glowing green data crystal, slight head tilt, cute and confident pose. Dark hoodie. Transparent background, clean cartoon style.
```

### 2. Walking / Patrolling
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes, mid-stride walking pose, one arm swinging, the other holding a glowing green data crystal. Dark hoodie, determined expression. Side view. Transparent background, clean cartoon style.
```

### 3. Celebrating / Victory
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes, jumping in the air with both arms raised triumphantly, glowing green data crystal held high overhead, big happy grin, sparkle effects around. Dark hoodie. Transparent background, clean cartoon style.
```

### 4. Hacking / Typing
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes, sitting at a tiny holographic keyboard, fingers typing rapidly, green code symbols floating around, focused intense expression. Dark hoodie. Transparent background, clean cartoon style.
```

### 5. Thinking / Puzzled
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes, one paw on chin in thinking pose, small question mark floating above head, slightly tilted head, curious expression. Dark hoodie. Transparent background, clean cartoon style.
```

### 6. Failed / Sad
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes dimmed, slumped shoulders, small sweat drop on forehead, disappointed expression, holding a cracked/dim data crystal. Dark hoodie. Transparent background, clean cartoon style.
```

### 7. Sleeping / Idle Timeout
```
Chibi pixel-art raccoon with burglar mask, eyes closed with "Zzz" floating above, curled up in a cozy ball, data crystal resting beside it, peaceful expression. Dark hoodie. Transparent background, clean cartoon style.
```

### 8. Sneaking / Stealth
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes, tiptoeing in a low crouch, looking left and right suspiciously, holding glowing green data crystal close to chest. Dark hoodie. Transparent background, clean cartoon style.
```

### 9. Running / Escape
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes wide with excitement, running at full speed with motion lines behind, clutching glowing green data crystal, big grin. Dark hoodie. Transparent background, clean cartoon style.
```

### 10. Pointing / Tutorial Guide
```
Chibi pixel-art raccoon with burglar mask and green glowing eyes, standing upright pointing forward with one paw, friendly welcoming smile, other paw holding glowing green data crystal. Dark hoodie. Transparent background, clean cartoon style.
```

---

## Style Modifiers

Add these to any prompt for variations:

| Modifier | Append to prompt |
|----------|-----------------|
| Larger size | `High resolution, 512x512, sharp details` |
| Pixel art | `16-bit pixel art style, retro game aesthetic` |
| Glow effect | `Neon green glow emanating from eyes and crystal, dark background` |
| Sticker style | `Die-cut sticker design, thick white outline, no background` |
| Animated sprite | `Sprite sheet format, 4 frames, consistent character` |

---

## Color Reference

- **Eyes glow:** `#00ED64` (MongoDB green)
- **Crystal glow:** `#00ED64` with `#0B3D2E` core
- **Mask:** `#1A1A2E` dark navy-black
- **Fur:** `#4A4A5A` medium grey with `#2D2D3D` darker stripes
- **Hoodie:** `#1E1E2E` dark charcoal
- **Background:** Transparent (always)

---

## Usage in Lovable

```
imagegen--generate_image({
  prompt: "<paste variant prompt here>",
  target_path: "src/assets/heist-mascot-<variant>.png",
  transparent_background: true,
  width: 512,
  height: 512,
  model: "fast"
})
```
