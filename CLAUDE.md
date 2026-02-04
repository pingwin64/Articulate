# Articulate - Project Guidelines

## 🚨 ABSOLUTE FORBIDDEN: NEVER TOUCH NUMU-APP

**NEVER read, edit, or reference ANY files from:**
- `/Users/alialfaras/Desktop/numu-app/`
- `/Users/alialfaras/numu/`
- Any folder named `numu` or `numu-app`

**Numu is a completely separate Emirati Arabic learning app.** It has NOTHING to do with Articulate. If you see references to landmarks, Arabic phrases, lessons, Emirati dialect, or falcons — STOP IMMEDIATELY. You are looking at the wrong project.

**This project is ONLY:** `/Users/alialfaras/Desktop/Articulate/`

---

## Project Overview

Articulate is a minimalist iOS reading app (Expo SDK 55 + React Native 0.83) that displays one word at a time. Design philosophy: **liquid glass minimalism** — clean, subtle, no garish colors or heavy UI elements.

## Tech Stack

- **Expo SDK 55** / **React Native 0.83** / **React 19**
- **Expo Router 55** (file-based routing, Stack navigator)
- **react-native-reanimated 4** (UI thread animations, worklets)
- **react-native-gesture-handler 2.30** (native gestures)
- **Zustand 5** + **MMKV** (state management + persistence)
- **RevenueCat** (subscriptions)
- **TypeScript strict mode**
- **Supabase** (Edge Functions for OpenAI proxy)

## ⚠️ CRITICAL: Supabase Project Configuration

**Articulate uses ONLY this Supabase project:**
- **Project Ref:** `mgwkhxlhhrvjgixptcnu`
- **URL:** `https://mgwkhxlhhrvjgixptcnu.supabase.co`
- **MCP URL:** `https://mcp.supabase.com/mcp?project_ref=mgwkhxlhhrvjgixptcnu`

**NEVER use project `jvqmniqdljdqkssekzzr`** — that is a completely different app (Emirati Arabic learning). If you see tables like `profiles`, `landmarks_progress`, `lessons_history`, `emirati_embeddings`, you are connected to the WRONG project.

**Correct Articulate tables:** None yet (app uses local MMKV storage). Edge functions only.

**Edge Function:** `openai-proxy` — handles quiz generation, PDF parsing, image scanning, and AI text generation.

**How to verify and fix MCP connection:**
1. In Claude Code, use `mcp__supabase__get_project_url` — should return `https://mgwkhxlhhrvjgixptcnu.supabase.co`
2. If it returns `jvqmniqdljdqkssekzzr`, the session is using the wrong cached credentials
3. To fix: Exit Claude Code, run `claude /mcp`, select "supabase", re-authenticate, then restart

**Red flags you're on the wrong project:**
- Tables named: `profiles`, `landmarks_progress`, `lessons_history`, `emirati_embeddings`, `fix_list`, `chat_history`
- Edge functions: `text-to-speech`, `chat-completion`, `speech-to-text`, `embeddings`, `pronunciation-dict`
- Any reference to Arabic, Emirati, landmarks, or lessons

**Correct Articulate setup:**
- No database tables (uses local MMKV only)
- One edge function: `openai-proxy`

## Directory Structure

```
src/
  app/           # Expo Router screens (file-based routes)
  components/    # Reusable UI (Glass*, WordDisplay, etc.)
  design/        # theme.ts — design tokens, colors, fonts, springs
  hooks/         # useTheme.ts
  lib/
    store/       # settings.ts — single Zustand store (persisted via MMKV)
    data/        # categories.ts, quizzes.ts — all content is local
```

## Critical Rules

### 1. Reanimated Worklets

**Any function called inside a gesture handler callback (`onUpdate`, `onEnd`, `onStart`, `onBegin`, `onFinalize`) or inside `useAnimatedStyle` / `useDerivedValue` that is NOT auto-workletized MUST have `'worklet';` as its first line.**

Auto-workletized (no directive needed):
- Callbacks passed directly to `useAnimatedStyle`, `useDerivedValue`, `useAnimatedReaction`
- Inline callbacks on gesture methods (`.onUpdate(() => { ... })`)

NOT auto-workletized (needs `'worklet';`):
- Helper functions defined outside the gesture/animated callback that are called from within it
- Any standalone function referenced inside UI-thread code

```tsx
// CORRECT
const denormalize = (ratio: number) => {
  'worklet';
  return minimumValue + ratio * (maximumValue - minimumValue);
};

// WRONG — will crash: "Tried to synchronously call a non-worklet function on the UI thread"
const denormalize = (ratio: number) => {
  return minimumValue + ratio * (maximumValue - minimumValue);
};
```

When calling React state setters or JS-only functions from the UI thread, always wrap with `runOnJS()`.

### 2. Design Aesthetic — No Garish UI

The app uses a minimal glass aesthetic. Never use:
- Bright colored backgrounds on cards/badges (no `rgba(255,215,0,...)`, no `rgba(255,149,0,...)`)
- Warning/gold/orange colored cards or badges
- Heavy card styling for simple status messages

Instead use:
- `colors.secondary` for subtle informational text
- `colors.muted` for hints
- Simple `Text` elements — no wrapping `View` with colored backgrounds for status messages
- `Animated.Text` with `FadeIn` for animated text reveals

Examples of what we replaced:
- Achievement badge: yellow card with icon -> simple `Animated.Text` in `colors.secondary`
- Streak warning: orange card -> plain `Text` in `colors.secondary`

### 3. Font System

There are exactly **4 fonts** in `FontFamilies` (theme.ts):
1. `sourceSerif` — Source Serif 4 (default, serif)
2. `system` — SF Pro Display (system sans-serif)
3. `jetBrains` — JetBrains Mono (monospace)
4. `literata` — Literata (serif)

**Do NOT add fonts that aren't actually bundled or available in React Native.** iOS system font names like `NewYork-Regular` are not valid RN font names and silently fall back to the system font. Always test that a new font renders distinctly from existing fonts before adding it.

When removing a font from `FontFamilies`:
- Update `FontFamilyKey` (derived automatically from `keyof typeof FontFamilies`)
- Add a migration in `settings.ts` persist config to remap saved preferences
- The `FontPicker` reads `FontFamilies` dynamically, so no separate update needed

### 4. Zustand Store Migrations

The store uses `zustand/middleware` persist with versioned migrations:

```typescript
{
  name: 'articulate-settings',
  version: 2,  // increment when schema changes
  storage: createJSONStorage(() => mmkvStorage),
  migrate: (persisted: any, version: number) => {
    if (version === 0) {
      // handle v0 -> v1 migration
    }
    return persisted;
  },
}
```

**Always add a migration when:**
- Removing or renaming a stored enum value (e.g., font family key)
- Changing the shape of persisted state
- Renaming a state key

### 5. Form Sheet Rendering (Expo Router SDK 55)

Screens with `presentation: 'formSheet'` need special handling:
- ScrollView must have `contentInsetAdjustmentBehavior="automatic"` for content to render properly under the sheet grabber
- Container View needs `flex: 1`
- Route params may not always propagate correctly to form sheets — if blank, try passing data via Zustand store state instead of route params

### 6. Quiz Button Visibility

The "Take Quiz" button on the complete screen is **always visible** for all users:
- Premium users: navigates directly to quiz
- Free users: shows lock indicator (`"Take Quiz  \u{1F512}"`) and opens paywall on tap

### 7. GlassButton Component

`GlassButton` accepts: `title`, `onPress`, `variant` (`'solid'` | `'outline'`), `style`, `disabled`.

It does NOT have an `icon` prop. To show a lock or icon indicator, embed it in the title string (e.g., `"Take Quiz  \u{1F512}"`).

### 8. FormSheet Parameter Workaround

When navigating to a formSheet screen, ALWAYS store the key parameters in the Zustand store before calling `router.push()`. Read from store as fallback in the target screen. Clear after use. This prevents the blank screen issue where route params don't propagate to formSheets.

```tsx
// Before navigation:
setSelectedCategoryKey(categoryKey);
router.push({ pathname: '/text-select', params: { categoryKey } });

// In target screen:
const params = useLocalSearchParams();
const selectedCategoryKey = useSettingsStore((s) => s.selectedCategoryKey);
const categoryKey = params.categoryKey || selectedCategoryKey || undefined;
// Clear after use:
setSelectedCategoryKey(null);
```

### 9. Daily Limits & Gating

Free users: 1 custom text upload per day, 3 core categories, default styling. Daily upload resets at midnight local time. Track via `dailyUploadDate` in store. Daily word goal tracked via `dailyWordGoal` / `dailyWordsToday`.

### 10. Native Module Version Mismatch (Worklets/Reanimated)

**Error:** `[Worklets] Mismatch between JavaScript part and native part of Worklets (X.X.X vs Y.Y.Y)`

This happens when the JS dependencies update but the native iOS build still has old compiled native code. Common after `git pull` or `npm install`.

**Fix (run in order):**
```bash
rm -rf node_modules && npm install
npx expo prebuild --clean
npx expo run:ios
```

**When to do this:**
- After pulling changes that updated `package.json` or `package-lock.json`
- After any reanimated/worklets/gesture-handler version changes
- When you see "Mismatch between JavaScript part and native part" errors
- When the app shows a red error screen about native modules

**Do NOT just run `npx expo start`** — that only starts Metro bundler and uses the existing native build. You must rebuild native code with `expo prebuild --clean` + `expo run:ios`.

## Navigation

- **index** — Home (onboarding for new users)
- **reading** — Main reading screen (`headerShown: true`, transparent header, `Stack.Toolbar` at bottom)
- **complete** — Post-reading celebration
- **profile** — Route is `settings.tsx`, display title is "Profile". `slide_from_right`, large title, icon is `user` (Feather) / `person.circle` (SF Symbol)
- **text-select** — `formSheet`, grabber visible, detents `[0.5, 1.0]`
- **paywall** — `formSheet`, detents `[0.75, 1.0]`
- **quiz** — Comprehension quiz
- **paste** — Custom text input (renamed header: "Your Text")

## Animation Conventions

- Use `Springs` from `theme.ts` (default, gentle, bouncy, snappy) — don't hardcode spring configs
- Press feedback: scale 1 -> 0.96 with 80ms press, 150ms release
- Entry animations: `FadeIn.delay(N).duration(300-400)` with staggered delays
- Use `withSpring` for interactive animations, `withTiming` for non-interactive transitions
- Breathing: subtle `1 -> 1.008 -> 1` over 3s, infinite repeat
- Check `reduceMotion` setting before adding infinite/repeating animations

## State Management Conventions

- All app state lives in a single Zustand store (`useSettingsStore`)
- Use selector pattern: `useSettingsStore((s) => s.fontFamily)` — never destructure the whole store in components that only need one value
- Actions are co-located with state in the store
- MMKV storage is synchronous — no async loading states needed
- Paywall has frequency limiting: 2h cooldown, 24h after 3 dismissals

## Premium / Free Boundaries

**Free features:** sourceSerif font, default color, default background, 3 core categories (story, article, speech), 1 custom text upload per day, daily word goal tracking
**Premium features:** all fonts, all colors, all backgrounds, all categories, unlimited custom texts, TTS, auto-play, chunk reading, breathing animation, quizzes, scan text (unlimited)

When gating a feature for free users:
- Show the control/button but trigger `setPaywallContext('locked_*')` on interaction
- Use appropriate `PaywallContext` string for tracking

## Content System

Categories and texts are defined in `src/lib/data/categories.ts`. All content is bundled locally (no network fetches). Words are pre-split into `string[]` arrays.

## Development Commands

```bash
# Start Metro bundler only (use if native build is up-to-date)
npx expo start --ios

# Full rebuild after pulling changes or updating dependencies
rm -rf node_modules && npm install
npx expo prebuild --clean
npx expo run:ios

# Open Xcode workspace (for native debugging)
open ios/Articulate.xcworkspace
```

## Common Patterns

### Theme-aware styling
```tsx
const { colors, glass, isDark } = useTheme();
// Use colors.primary, colors.secondary, colors.muted, etc.
// Use glass.fill, glass.border for glass morphism
```

### Haptic feedback (always check preference)
```tsx
const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
if (hapticEnabled) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
```

### Gesture + runOnJS bridge
```tsx
const gesture = Gesture.Tap().onEnd(() => {
  // UI thread — can read shared values, call worklets
  runOnJS(handlePress)(); // bridge to JS thread for state updates
});
```

---

## Lessons Learned (Common Bugs & Fixes)

### 11. Unicode Escape Sequences in JSX

**Error:** Unicode escape like `\u{1F512}` renders as literal text instead of emoji

**Wrong:**
```tsx
<GlassButton title="Take Quiz  \u{1F512}" />  // Shows: Take Quiz  \u{1F512}
```

**Correct:**
```tsx
<GlassButton title="Take Quiz 🔒" />  // Shows: Take Quiz 🔒
```

Always use actual emoji characters in JSX strings, not escape sequences.

### 12. Navigation with GlassCard - Never Use Link Wrapper

**Problem:** Wrapping GlassCard with `<Link asChild><Pressable>` breaks touch events.

GlassCard uses gesture-handler for tap detection. When `onPress` is undefined, no gesture handler is registered, and Link's touch propagation fails through animated layers.

**Wrong:**
```tsx
<Link href="/screen" asChild>
  <Pressable>
    <CategoryCard category={cat} />  // NO onPress = broken!
  </Pressable>
</Link>
```

**Correct:**
```tsx
<CategoryCard
  category={cat}
  onPress={() => router.push('/screen')}  // Pass onPress directly
/>
```

**Rule:** Always pass `onPress` directly to GlassCard-based components. Never rely on Link wrapper for navigation.

### 13. headerLargeTitle Causes Scroll Issues

**Problem:** Using `headerLargeTitle: true` in Stack.Screen options causes the content to start scrolled down, requiring user to scroll up to see the top.

**Wrong:**
```tsx
<Stack.Screen
  name="achievements"
  options={{
    headerLargeTitle: true,  // Content starts scrolled down!
    ...
  }}
/>
```

**Correct:**
```tsx
<Stack.Screen
  name="achievements"
  options={{
    title: 'Achievements',  // Use regular title instead
    ...
  }}
/>
```

### 14. Adding Expo Packages with Native Code

**Error:** "Cannot find native module 'ExpoXXX'" after npm install

When adding expo packages that have native code (expo-store-review, expo-camera, etc.), you MUST rebuild native:

```bash
npm install expo-store-review  # JS only - not enough!
npx expo prebuild --clean      # Rebuilds native iOS/Android
npx expo run:ios               # Runs with new native code
```

**Packages requiring native rebuild:**
- expo-store-review
- expo-camera
- expo-image-picker
- expo-document-picker
- Any package with native modules

### 15. Progress Indicators - Only Show When Incomplete

**UX Rule:** Progress wheels/rings should only appear for locked/incomplete items. When unlocked/complete, the progress indicator should disappear - not show as "100% complete".

```tsx
// Show progress ring only when NOT unlocked
{!unlocked && (
  <ProgressRing progress={progress} />
)}
```

### 16. Achievements Screen Design Principles

- **Badges only** - no History tab (history belongs in Profile)
- Progress wheels show only for locked badges
- Tier pills (BRONZE, SILVER, GOLD) show only for unlocked badges
- Icons are muted (50% opacity) when locked, full color when unlocked

### 17. Badge Nudge Navigation Pattern

When showing "X texts to go →" for a badge, tapping should navigate to START reading, not to achievements:

```tsx
// Category badges → text selection for that category
if (badge.category === 'category' && badge.categoryKey) {
  router.push({ pathname: '/text-select', params: { categoryKey } });
}
// Text/word badges → navigate to a reading category
else if (badge.category === 'texts' || badge.category === 'words') {
  router.push({ pathname: '/text-select', params: { categoryKey: 'story' } });
}
```

### 18. Locked Feature CTAs

When showing locked feature prompts, be specific about what unlocks:

**Wrong:** "Go Pro" (vague)
**Correct:** "Unlock Unlimited Uploads" (specific benefit)

Also include a clear dismiss option: "I'll wait until tomorrow"

### 19. Content System Architecture

- All 30 bundled texts are in `src/lib/data/categories.ts`
- Content is static (no API/dynamic loading)
- Custom user texts stored in Zustand/MMKV
- To add variety, add more texts to categories.ts and rebuild app

### 20. Breathing Animation Cleanup

**Problem:** Breathing animation continues indefinitely if disabled mid-cycle

**Fix:** Always cancel animation and reset shared value in cleanup:
```tsx
return () => {
  if (timer) clearTimeout(timer);
  cancelAnimation(breatheScale);
  breatheScale.value = 1;
};
```

Also check both app setting AND system reduce motion preference before enabling repeating animations.

### 21. Memoize Expensive Lookups in Animated Components

**Problem:** Color/font lookups called on every render during animations

**Fix:** Use `useMemo` for functions that search arrays or compute derived values:
```tsx
const displayColor = useMemo(
  () => getWordColor(wordColor, colors.primary),
  [wordColor, colors.primary]
);
```

### 22. Paywall CRO Best Practices

- Default plan should be Monthly (best LTV), not Lifetime
- Show streak motivation at 1+ days, not just 3+
- Use context-aware CTAs ("Unlock Unlimited Uploads" not "Get Lifetime Access")
- Add daily cost framing ("~$0.33/day")
- Move "BEST VALUE" badge to Monthly ("MOST POPULAR")
- Replace "Not now" with "Continue Free" (clearer intent)
- Use benefit-focused feature copy, not feature-focused

### 23. Onboarding Copy Principles

- Add value promise to the silent start ("This is how you build focus")
- Contextualize personalization ("The right font and colors keep you coming back")
- Frame daily goal around habits, not time ("Set your daily habit" not "Set your daily goal")
- Add guidance to category selection ("Pick what speaks to you")

### 24. Foot-in-Door Strategy: 1 Free Quiz Per Day

Give free users a taste of premium features to increase conversion:
- Free users get 1 quiz per day (tracked via `freeQuizUsedToday`, `lastFreeQuizDate`)
- Show "Take Quiz (Free Today)" button when available
- Quiz screen checks `canUseFreeQuiz()` before loading
- After daily limit, show specific upgrade CTA: "Unlock Unlimited Quizzes"
- Include "I'll wait until tomorrow" dismiss option

### 25. Badge-Triggered Upsells

Show upgrade prompts at moments of achievement to capitalize on positive emotions:
- Track `lastUnlockedBadgeId` in store to detect new badge unlocks
- After badge animation (2.5s delay), show upsell for free users
- Keep it subtle: "You're making progress! See what's included →"
- Don't show on first reading (already has paywall)

### 26. Streak-at-Risk Banners

Use loss aversion to drive engagement:
- Detect "at risk" state: 20+ hours since last read (4h buffer before 48h reset)
- Show actionable card: "Don't lose your X-day streak"
- Include CTA that navigates directly to reading selection
- Use warning color for icon to draw attention

### 27. Category Preview Cards

Give free users a glimpse of locked premium content:
- Show first text title: `Includes "Text Title" + X more`
- Displayed on locked CategoryCard when `showPreview={true}`
- Creates curiosity and FOMO for premium categories
