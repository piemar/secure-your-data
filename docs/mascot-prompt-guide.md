# MongoDB Game Day — Mascot Prompt Guide

Use these prompts to generate consistent plush turtle mascot variants. All prompts target image generation tools (Midjourney, DALL-E, Gemini, etc.).

---

## Base Character Description

> **Adorable round plush stuffed-animal style turtle mascot. Very soft and squishy looking, with a very round head, big shiny black kawaii eyes, rosy pink cheeks, a sweet smile, and light green smooth skin. Wearing a dark green MongoDB zip-up hoodie with a leaf logo. Brown shell visible from behind. Small round stubby arms and legs. 3D rendered style, soft lighting, transparent background.**

---

## Pose Variants

### 1. Idle / Default (Sitting)
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy looking, wearing a dark green MongoDB zip-up hoodie. Very round head, big shiny black kawaii eyes, rosy cheeks, sweet smile, light green smooth skin. Sitting pose, holding a glowing green science beaker/flask. Brown shell visible. Small colorful stickers and badges on the ground. 3D rendered style, soft lighting. On a solid white background.
```

### 2. Walking
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. Mid-waddle walking pose, one stubby leg forward, slight body tilt, cheerful expression. Very round head, big shiny black kawaii eyes, rosy cheeks, light green skin. Brown shell visible. Side view. 3D rendered style, soft lighting. On a solid white background.
```

### 3. Celebrating / Victory
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. Jumping in the air with both stubby arms raised in celebration, huge excited open-mouth grin. Sparkles and confetti around. Very round head, big shiny black kawaii eyes, rosy cheeks. Brown shell visible. 3D rendered style, soft lighting. On a solid white background.
```

### 4. Hacking / Typing
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. Sitting at a small laptop, stubby hands on keyboard, focused determined expression, green code symbols floating on screen. Very round head, big shiny black kawaii eyes, rosy cheeks. Brown shell visible. 3D rendered style, soft lighting. On a solid white background.
```

### 5. Thinking / Puzzled
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. One stubby hand on chin in thinking pose, small question mark floating above head, slightly tilted head, curious expression. Very round head, big shiny black kawaii eyes, rosy cheeks. Brown shell visible. 3D rendered style, soft lighting. On a solid white background.
```

### 6. Failed / Sad
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. Slumped shoulders, small sweat drop on forehead, disappointed droopy expression. Holding a cracked dim beaker. Very round head, big shiny black kawaii eyes (teary), rosy cheeks. Brown shell visible. 3D rendered style, soft lighting. On a solid white background.
```

### 7. Sleeping / Idle Timeout
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. Eyes closed peacefully, "Zzz" floating above, curled up in a cozy ball tucked slightly into shell. Very round head, rosy cheeks. Brown shell visible. 3D rendered style, soft warm lighting. On a solid white background.
```

### 8. Sneaking / Stealth
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. Tiptoeing in a low crouch, looking left and right suspiciously, holding glowing green flask close to chest, mischievous grin. Very round head, big shiny black kawaii eyes, rosy cheeks. Brown shell visible. 3D rendered style, soft lighting. On a solid white background.
```

### 9. Pointing / Tutorial Guide
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. Standing upright pointing forward with one stubby hand, friendly welcoming smile. Very round head, big shiny black kawaii eyes, rosy cheeks. Brown shell visible. 3D rendered style, soft lighting. On a solid white background.
```

### 10. Waving / Greeting
```
Adorable round plush stuffed-animal style turtle mascot, very soft and squishy, wearing a dark green MongoDB zip-up hoodie. One stubby arm raised waving hello, big friendly smile. Very round head, big shiny black kawaii eyes, rosy cheeks. Brown shell visible. 3D rendered style, soft lighting. On a solid white background.
```

---

## Style Modifiers

| Modifier | Append to prompt |
|----------|-----------------|
| Higher quality | Use `model: "standard"` or `"premium"` |
| Pixel art variant | Add `16-bit pixel art style, retro game aesthetic` |
| Glow effect | Add `Neon green glow emanating from flask, dark background` |
| Sticker style | Add `Die-cut sticker design, thick white outline` |

---

## Color Reference

- **Skin:** Light green, soft matte
- **Eyes:** Big, shiny black, kawaii style
- **Cheeks:** Rosy pink blush
- **Hoodie:** Dark green (#1B4332), MongoDB leaf logo
- **Shell:** Brown/tan, visible behind hoodie
- **Flask glow:** `#00ED64` (MongoDB green)
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
  model: "standard"
})
```
