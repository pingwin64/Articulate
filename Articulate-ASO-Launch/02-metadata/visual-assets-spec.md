# Articulate - Visual Assets Specification (Apple App Store)

**Status:** Ready for Production
**Platform:** iOS App Store Only
**Last Updated:** February 13, 2026

---

## App Icon

### Requirements
- **Size:** 1024 × 1024 px
- **Format:** PNG, no alpha/transparency
- **Color space:** sRGB or P3
- **No rounded corners** (Apple applies mask automatically)
- **No text smaller than icon** (unreadable at 60×60px)

### Design Recommendations

**Core Concept:** The icon should instantly communicate "focused reading" and "vocabulary learning" while matching the app's liquid glass minimalism aesthetic.

**Approach 1: Single Word Symbol**
- Large "A" letterform in the center (for Articulate)
- Minimalist geometric style
- Subtle gradient (light to slightly darker)
- Clean background (white, cream, or soft blue)
- This signals: reading, literacy, simplicity

**Approach 2: Sequential Word Flow**
- Three words stacked vertically getting larger (representing RSVP flow)
- Words: "Read" (small), "Focus" (medium), "Learn" (large)
- Creates visual hierarchy showing progression
- Background: gradient from top to bottom

**Approach 3: Abstract Focus Symbol**
- Concentric circles or spotlight effect
- Center circle bright, outer circles fade
- Represents focus and attention
- Pairs with app's reading mechanic (one word in focus)

### Testing Requirements
- View at 60×60px (Home Screen) - must be recognizable
- View at 40×40px (Spotlight) - must not look muddy
- Test on light wallpapers (white, cream, photo)
- Test on dark wallpapers (black, dark blue)
- Avoid fine details that disappear at small sizes

### Tools
- Figma (vector design, easy export at exact size)
- Sketch (iOS-specific templates)
- Affinity Designer (one-time purchase alternative)

---

## Screenshots

### Required Sizes (iPhone Only)

| Device | Size (pixels) | Priority | Notes |
|--------|---------------|----------|-------|
| iPhone 6.7" (Pro Max 15/16) | 1290 × 2796 | REQUIRED | Primary submission size |
| iPhone 6.9" (Pro Max 16) | 1320 × 2868 | REQUIRED | New standard for latest devices |

**Note:** App Store Connect auto-scales from 6.7" to smaller devices. You can optionally upload 6.5" (1284×2778) and 5.5" (1242×2208) for pixel-perfect display on older devices, but not required.

### Format Requirements
- PNG or JPEG
- No alpha channel
- Exact pixel dimensions (no approximations)
- 72 DPI minimum
- File size: <500KB per screenshot recommended

### Quantity
- **Minimum:** 1 screenshot per required size
- **Maximum:** 10 screenshots per size
- **Recommended:** 6-8 screenshots
- **Critical:** First 3 are visible in search results without scrolling

---

## Screenshot Content Strategy

### Screenshot 1: RSVP Reading in Action (MOST IMPORTANT)
**Why First:** This is the unique differentiator. No other reading app does one-word-at-a-time like this. Users need to see this immediately to understand what makes Articulate different.

**Content to Show:**
- Clean reading screen
- Single word displayed large and centered: "FOCUS" or "LEARN"
- Subtle word counter (e.g., "23 / 156")
- Minimal UI - emphasize the word itself

**Caption (overlay text):**
```
Read One Word at a Time
```

**Design Notes:**
- Use actual app screenshot (don't mock up)
- Background should match app theme (light or dark mode)
- Word should be large enough to read in thumbnail
- Keep UI chrome minimal - spotlight on the word

---

### Screenshot 2: Speed Control
**Why Second:** Addresses immediate question: "Can I control the pace?"

**Content to Show:**
- Reading screen with speed slider visible
- WPM indicator (e.g., "250 WPM")
- Play/pause controls visible

**Caption:**
```
Your Speed, Your Pace
```

**Alternative Caption:**
```
100-600 Words Per Minute
```

**Design Notes:**
- Show the speed control UI clearly
- Consider showing two states (slow vs fast) in split view

---

### Screenshot 3: 30+ Curated Texts
**Why Third:** Shows there's built-in content. Users don't need to bring their own material immediately.

**Content to Show:**
- Text library screen
- Visible categories: Stories, Philosophy, Speeches, Poetry
- Text cards with titles visible
- Variety of content types shown

**Caption:**
```
30+ Curated Texts to Explore
```

**Alternative Caption:**
```
Stories, Speeches & More
```

**Design Notes:**
- Show enough variety to communicate breadth
- Use actual category cards from the app

---

### Screenshot 4: AI Comprehension Quizzes
**Why Fourth:** Key differentiator. Most speed readers don't test comprehension.

**Content to Show:**
- Quiz screen with question visible
- 4 multiple-choice answers
- Clean, readable layout
- Progress indicator (e.g., "Question 2/5")

**Caption:**
```
Test Your Comprehension
```

**Alternative Caption:**
```
AI-Generated Quizzes
```

**Design Notes:**
- Question should be readable in thumbnail
- Show engaging question (not generic)
- Include checkmark or score feedback if space allows

---

### Screenshot 5: Word Bank & Flashcards
**Why Fifth:** Second major differentiator. Vocabulary learning through review.

**Content to Show:**
- Flashcard with word displayed: "ARTICULATE"
- Flip card UI element visible
- Definition shown on back (or flipping animation)
- Word bank list in background

**Caption:**
```
Build Your Vocabulary
```

**Alternative Caption:**
```
Save & Review Words
```

**Design Notes:**
- Word should be prominent
- Show the save/heart icon if it fits
- Consider showing both sides of flashcard in split view

---

### Screenshot 6: Pronunciation Practice
**Why Sixth:** Unique feature no competitor has. Premium positioning.

**Content to Show:**
- Pronunciation drill screen
- Word displayed: "PRONUNCIATION"
- Microphone icon active
- Score feedback: "95% Accurate!" with checkmark

**Caption:**
```
Perfect Your Pronunciation
```

**Alternative Caption:**
```
AI Pronunciation Scoring
```

**Design Notes:**
- Show the feedback state (score + checkmark)
- Make mic icon prominent
- Use colors that signal success (green accent)

---

### Screenshot 7: Daily Streaks & Progress
**Why Seventh:** Gamification appeals to habit-forming users. Shows depth.

**Content to Show:**
- Profile/insights screen
- Streak counter: "7 Day Streak 🔥"
- Words read stat: "1,247 Words Read"
- Weekly challenge progress visible
- Achievement badges if space allows

**Caption:**
```
Track Your Reading Habit
```

**Alternative Caption:**
```
Build Daily Streaks
```

**Design Notes:**
- Show impressive numbers (not "1 day streak")
- Use actual app stats screen
- Include fire emoji for streak if it renders well

---

### Screenshot 8: Custom Text Upload
**Why Eighth:** Shows flexibility. Users can bring their own content.

**Content to Show:**
- Import screen with three options visible:
  - Paste text icon
  - Camera scan icon
  - File picker icon
- Clean, simple layout

**Caption:**
```
Import Any Text You Want
```

**Alternative Caption:**
```
Paste, Scan, or Upload
```

**Design Notes:**
- All three import methods should be visible
- Icons should be clear and large
- Show actual app UI

---

### Screenshot 9 (Optional): Accessibility Features
**Why Ninth:** OpenDyslexic font is a differentiator for dyslexic readers.

**Content to Show:**
- Font picker showing 5 fonts
- OpenDyslexic font highlighted
- Side-by-side comparison of reading screen in different fonts

**Caption:**
```
Designed for Every Reader
```

**Alternative Caption:**
```
Including OpenDyslexic Font
```

**Design Notes:**
- Make font differences visible in thumbnail
- Show OpenDyslexic specifically (differentiator)

---

### Screenshot 10 (Optional): Themes & Customization
**Why Tenth:** Shows polish and personalization.

**Content to Show:**
- Theme picker or settings screen
- Multiple color themes visible
- Light/Dark mode toggle
- Unlockable cosmetics hint

**Caption:**
```
Unlock Themes as You Level Up
```

**Alternative Caption:**
```
Beautiful, Minimal Design
```

---

## Screenshot Design Guidelines

### Layout Pattern

Use consistent framing across all screenshots:

```
┌─────────────────────────────┐
│                             │
│   CAPTION TEXT              │  ← 2-5 words max
│   (top, large, bold)        │
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │  Device Mockup      │   │  ← Actual app screenshot
│   │  (optional frame)   │   │
│   │                     │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### Typography
- **Caption:** 48-56pt, Bold (SF Pro Display or Source Serif 4)
- **Subcaption (optional):** 24-28pt, Regular
- **Keep captions to 4 words or fewer** - scannability matters
- High contrast: white text on dark background, or dark text on light

### Color & Background
- **Option A:** Match app's glass morphism aesthetic
  - Subtle gradient backgrounds
  - Light mode: cream/white gradient
  - Dark mode: dark blue/black gradient
- **Option B:** Solid color backgrounds for maximum contrast
  - Light: white or very light gray
  - Dark: #1C1C1E (iOS system dark)
- **Consistency:** All screenshots should use same background style

### Device Frames
- **Recommended:** Use subtle frames (thin bezels) or frameless
- **Tools:** Rotato, Previewed, Figma device mockups
- **Device:** iPhone 15 Pro Max or 16 Pro Max black or white
- **Alternative:** Frameless (floating screenshot) for cleaner look

### Text Overlays
- Position captions at top 20% of image
- Leave breathing room (don't crowd the app UI)
- Ensure text is readable at thumbnail size (500px wide)
- Avoid placing text over busy UI elements

### Do NOT:
- Show real user data or names
- Use placeholder text (Lorem ipsum)
- Show low battery or fake carrier names
- Use inconsistent visual styles across screenshots
- Add too much text - captions should scan in 1 second

---

## App Preview Video (Optional but Recommended)

### Specs
| Property | Requirement |
|----------|-------------|
| Duration | 15-30 seconds |
| Format | H.264, .mov or .mp4 |
| Resolution | 1290×2796 (6.7") or 1320×2868 (6.9") |
| Frame rate | 30 fps minimum |
| Audio | Optional (most browse with sound off) |
| Quantity | Up to 3 per localization |

### Recommended Video Flow (25 seconds)

**0-5s: Hook - The Reading Experience**
- App opens to reading screen
- Single word appears: "FOCUS"
- Word changes to next: "BUILDS"
- Then: "FLUENCY"
- Show the core RSVP mechanic immediately

**5-10s: Speed & Control**
- Speed slider adjusts
- Words flow faster (show speed increase)
- User has control

**10-15s: Quiz & Learning**
- Text completes
- Quiz screen appears
- Question with multiple choice answers
- Checkmark appears (correct answer)

**15-20s: Word Bank**
- Flashcard flips showing definition
- Word saves with heart icon
- Shows vocabulary building

**20-25s: Progress & CTA**
- Streak counter increments
- Achievement badge unlocks
- End card: "Articulate - Read & Learn"
- Subtitle: "Download Free"

### Video Production Tips
- **First 3 seconds must hook** - show the unique word-by-word reading
- **No hands/fingers** (Apple policy for iOS previews)
- **Add captions** - most users watch without sound
- **Use actual app footage** - screen recordings with iOS Simulator or device
- **Smooth transitions** - use fade or slide between sections
- **End with clear CTA** - app name + download prompt

### Tools
- **Screen Recording:** QuickTime (Mac), iOS Simulator
- **Editing:** Final Cut Pro, iMovie (free), DaVinci Resolve (free)
- **Motion Graphics:** Motion (Mac), After Effects
- **Templates:** Envato Elements (App Preview templates)

---

## Production Workflow

### Step 1: Capture Screenshots
1. Launch app on iOS Simulator (6.7" or 6.9" device)
2. Navigate to each key screen
3. Use Cmd+S to save screenshot (exact pixel dimensions)
4. Save all screenshots to folder: `screenshots/raw/`

### Step 2: Design Overlays
1. Open Figma or design tool
2. Create artboards at exact sizes:
   - 1290 × 2796 (6.7")
   - 1320 × 2868 (6.9")
3. Import raw screenshot
4. Add background (gradient or solid)
5. Add caption text (48-56pt bold)
6. Add device frame (optional)
7. Export at @1x (exact pixels)

### Step 3: Optimize Files
1. Use ImageOptim (Mac) or TinyPNG to compress
2. Keep file sizes under 500KB per screenshot
3. Verify dimensions are exact (not rounded)

### Step 4: Upload to App Store Connect
1. Go to App Store Connect > My Apps > Articulate
2. Navigate to version > App Store tab
3. Upload screenshots for each device size
4. Drag to reorder (first screenshot is most important)
5. Preview on different devices

---

## Screenshot Text Overlays (Copy-Paste Ready)

Use these exact captions for consistency:

```
Screenshot 1: Read One Word at a Time
Screenshot 2: Your Speed, Your Pace
Screenshot 3: 30+ Curated Texts to Explore
Screenshot 4: Test Your Comprehension
Screenshot 5: Build Your Vocabulary
Screenshot 6: Perfect Your Pronunciation
Screenshot 7: Track Your Reading Habit
Screenshot 8: Import Any Text You Want
Screenshot 9: Designed for Every Reader
Screenshot 10: Unlock Themes as You Level Up
```

---

## Pre-Submission Checklist

### Icon
- [ ] 1024×1024px PNG created
- [ ] No transparency or alpha channel
- [ ] No rounded corners
- [ ] Readable at 60×60px
- [ ] Tested on light and dark wallpapers

### Screenshots
- [ ] 6.7" (1290×2796) screenshots created - minimum 6
- [ ] 6.9" (1320×2868) screenshots created - minimum 6
- [ ] First screenshot shows RSVP reading (unique value prop)
- [ ] Captions are 4 words or fewer
- [ ] Consistent visual style across all screenshots
- [ ] No placeholder text or real user data visible
- [ ] File sizes under 500KB each
- [ ] All dimensions exact (not approximated)

### App Preview (Optional)
- [ ] 15-30 seconds duration
- [ ] H.264, .mov or .mp4 format
- [ ] Correct resolution (1290×2796 or 1320×2868)
- [ ] No hands or fingers visible
- [ ] Captions added for sound-off viewing
- [ ] First 3 seconds hook viewer with RSVP reading

### Final Validation
- [ ] All assets uploaded to App Store Connect
- [ ] Preview checked on App Store Connect (desktop and mobile view)
- [ ] Screenshots display correctly in search results (first 3 visible)
- [ ] Icon looks sharp at all sizes in App Store preview
- [ ] Metadata (title, subtitle, description) aligns with visuals

---

## Tools & Resources

### Design Tools
- **Figma** (free) - https://figma.com
  - Device mockup templates available
  - Collaborative, cloud-based
- **Sketch** ($99/year) - https://sketch.com
  - iOS-specific templates
  - Mac only
- **Affinity Designer** ($74.99 one-time) - https://affinity.serif.com
  - No subscription
  - Professional-grade

### Mockup Tools
- **Rotato** ($49 one-time) - https://rotato.app
  - 3D device mockups
  - Drag and drop screenshots
- **Previewed** (free tier) - https://previewed.app
  - Browser-based
  - Fast iteration
- **Shotbot** (free) - https://shotbot.io
  - Quick App Store screenshot generator

### Compression Tools
- **ImageOptim** (free, Mac) - https://imageoptim.com
- **TinyPNG** (free, web) - https://tinypng.com

### Video Tools
- **iMovie** (free, Mac)
- **DaVinci Resolve** (free) - https://blackmagicdesign.com
- **Final Cut Pro** ($299, Mac)

---

## Common Mistakes to Avoid

1. **Too much text on screenshots** - Keep captions to 4 words max
2. **Inconsistent styling** - All screenshots should match visually
3. **Cluttered first screenshot** - Lead with simplicity and unique value
4. **Wrong dimensions** - Apple rejects screenshots with incorrect sizes
5. **Low contrast captions** - Text must be readable at thumbnail size
6. **Showing too many features** - One clear message per screenshot
7. **Ignoring thumbnail view** - Most users see small versions first
8. **Generic captions** - "Feature 1", "Feature 2" don't convert
9. **No clear hierarchy** - First 3 screenshots are critical
10. **Outdated UI** - Update screenshots with every major redesign

---

## Localization Notes

Even if Articulate is English-only, consider:
- **UK English:** Same screenshots, captions use British spelling if needed
- **Australian English:** Same as UK
- **Future markets:** Spanish, Portuguese, Japanese (translate caption overlays)

App Store Connect allows different screenshots per locale - useful for A/B testing across regions.

---

## A/B Testing Strategy (Post-Launch)

Use App Store Connect's Product Page Optimization to test:

### Test 1: First Screenshot Variants
- **Variant A (Current):** Reading screen with "Read One Word at a Time"
- **Variant B:** Benefit-focused: "Read 2x Faster, Remember More"
- **Variant C:** Social proof: "10,000+ Learners Love Articulate"

**Metric:** Conversion rate (product page views → downloads)

### Test 2: Icon Variants
- **Variant A (Current):** [Your designed icon]
- **Variant B:** Simplified icon (fewer details, bolder shape)
- **Variant C:** Icon with subtle color gradient

**Metric:** Click-through rate (search results → product page)

### Test 3: Video vs No Video
- **Variant A:** 8 screenshots, no video
- **Variant B:** App Preview video + 7 screenshots

**Metric:** Time on page, conversion rate

---

**Next Steps:**
1. Design app icon following recommendations
2. Capture raw screenshots from app (8-10 key screens)
3. Create overlays with captions in Figma
4. Export at exact dimensions
5. Upload to App Store Connect
6. Preview and validate before submission

**Questions?** Email admin@ordco.net
