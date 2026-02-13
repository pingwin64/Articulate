# Articulate - Project Guidelines

## 🚨 ABSOLUTE FORBIDDEN: NEVER TOUCH NUMU-APP

**NEVER read, edit, or reference ANY files from:**
- `/Users/alialfaras/Desktop/numu-app/`
- `/Users/alialfaras/numu/`
- Any folder named `numu` or `numu-app`

**Numu is a completely separate Emirati Arabic learning app.** It has NOTHING to do with Articulate. If you see references to landmarks, Arabic phrases, lessons, Emirati dialect, or falcons — STOP IMMEDIATELY. You are looking at the wrong project.

**This project is ONLY:** `/Users/rm/Desktop/apps/articulate/`

---

## Contact & Support

- **Support email for all user-facing surfaces:** `admin@ordco.net`
- This applies to: Privacy Policy, Terms of Service, App Store metadata, in-app Contact Support, and any future contact references
- **Never use** `support@articulate.app` — that domain is not configured

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

**Edge Function:** `openai-proxy` — handles quiz generation, PDF parsing, image scanning, AI text generation, and audio transcription (Whisper).

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

There are exactly **5 fonts** in `FontFamilies` (theme.ts):
1. `sourceSerif` — Source Serif 4 (default, serif)
2. `system` — SF Pro Display (system sans-serif)
3. `jetBrains` — JetBrains Mono (monospace)
4. `literata` — Literata (serif)
5. `openDyslexic` — OpenDyslexic (accessibility, bundled OTF in assets/fonts/)

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
- **Prefer `withTiming` + `Easing` over `withSpring`** for selection/check animations. Bouncy springs (low damping, overshoot) feel gamified — not "liquid glass minimalism." Use `withTiming` with `Easing.out(Easing.ease)` or `Easing.out(Easing.cubic)` for smooth, controlled motion.
- Only use `withSpring` for direct-manipulation gestures (dragging, flicking) where physics feel natural
- Breathing: subtle `1 -> 1.008 -> 1` over 3s, infinite repeat
- Check `reduceMotion` setting before adding infinite/repeating animations

## State Management Conventions

- All app state lives in a single Zustand store (`useSettingsStore`)
- Use selector pattern: `useSettingsStore((s) => s.fontFamily)` — never destructure the whole store in components that only need one value
- Actions are co-located with state in the store
- MMKV storage is synchronous — no async loading states needed
- Paywall has frequency limiting: 2h cooldown, 24h after 3 dismissals

## Premium / Free Boundaries

**Free features:** sourceSerif font, default color, default background, 3 core categories (story, article, speech), 1 custom text upload per day, daily word goal tracking, 2 definitions/day, 1 quiz/day, 3 pronunciations/day, 1 listen & repeat/day
**Premium features:** all fonts, all colors, all backgrounds, all categories, unlimited custom texts, TTS, auto-play, chunk reading, breathing animation, unlimited quizzes, unlimited definitions, scan text (unlimited), **entire library** (word bank, favorites, custom texts)

When gating a feature for free users:
- Show the control/button but trigger `setPaywallContext('locked_*')` on interaction
- Use appropriate `PaywallContext` string for tracking
- For library: use `'locked_library'` context

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

### 28. Library is Pro-Only

The entire library feature (all three tabs) is gated for pro users:
- **Words** (word bank), **Favs** (favorites), **Texts** (custom texts) — all locked
- Home screen shelf books show lock icons for free users
- Tapping any book triggers `setPaywallContext('locked_library')`
- Library screen itself has a pro gate (locked state if `!isPremium`)
- Profile "My Library" card also gates with paywall for free users

Navigation pattern for library tabs:
```tsx
router.push({ pathname: '/library', params: { tab: 'words' } });
router.push({ pathname: '/library', params: { tab: 'favorites' } });
router.push({ pathname: '/library', params: { tab: 'texts' } });
```

### 29. Apple HIG Compliance (Touch Targets, Text, Contrast)

**44pt Minimum Touch Targets:**
- All buttons, icon buttons, toggles must have 44x44pt touch area
- Use `hitSlop={12}` on small elements to extend touch area
- `HitTargets` constant in `theme.ts`: `{ minimum: 44, hitSlop: 12 }`

Components updated for HIG compliance:
- `GlassSlider`: thumb 28px + 44px track height
- `GlassSegmentedControl`: 44px height
- `GlassToggle`: hitSlop for 44pt vertical
- Header buttons: 44x44px

**11pt Minimum Text Size:**
- Never use font sizes below 11px
- Badge text, tier pills, meta text — all must be ≥11px

**Color Contrast (WCAG AA):**
- Muted colors must have 4.5:1 contrast ratio
- Light mode `muted`: `#757575` (was `#AAAAAA`)
- Dark mode `muted`: `#8E8E93` (iOS system gray)

### 30. Paywall Layout Psychology

**Standard paywall flow (proven to convert):**
1. **Headline** (hook)
2. **Features** (build desire) — 4 compact checkmarks
3. **Pricing** (after they're sold on value)
4. **CTA** (action)

**Wrong:** Putting prices at the top causes sticker shock before value is communicated.

**Compact layout tips:**
- Headline: 28px, tight spacing
- Features: Simple checkmarks, no card wrapper, 4 items max
- Plan cards: 100px min-height, tight padding
- Remove duplicate social proof (don't show both pill AND footer text)
- `bounces={false}` on ScrollView for cleaner feel

### 31. JS-Only Changes: Use `expo start`, NOT `expo run:ios`

**CRITICAL:** If you only changed TypeScript/JS files (no native modules added/removed), use:
```bash
npx expo start --ios
```
This starts Metro and hot-reloads in ~5 seconds.

**NEVER run `npx expo prebuild --clean` + `npx expo run:ios` for JS-only changes.** That wipes the `ios/` folder and does a full Xcode rebuild (10-15 minutes). Only do a native rebuild when:
- You added a package with native code (expo-camera, expo-sharing, etc.)
- You see "Cannot find native module" errors
- package.json dependencies changed

### 32. npm install Needs `--legacy-peer-deps`

This project has peer dependency conflicts (e.g., `@react-native-community/datetimepicker` vs expo@55 preview). Always use:
```bash
npm install --legacy-peer-deps
npm install <package> --legacy-peer-deps
```
Plain `npm install` will fail with ERESOLVE errors.

### 33. Claude Code CLI Is Non-Interactive

Commands run from Claude Code cannot respond to interactive prompts (y/n questions, selections). This means:
- `npx expo start --ios` will hang on Expo Go update prompts
- Any command requiring user input will fail silently or error

**Workaround:** Tell the user to run interactive commands in their own terminal. Don't waste time trying env vars or flags to bypass prompts.

### 34. Don't Replace GlassCard with Plain Views

**Problem:** GlassCard uses BlurView which blurs whatever is behind it. Adjacent GlassCards may appear slightly different shades depending on background content.

**Wrong approach:** Replacing GlassCard with a plain `<Pressable>` or `<View>` to get uniform colors. This breaks the glass morphism aesthetic, loses the blur effect, gradient highlight, and press animation.

**Correct approach:** Accept the subtle shade variation as inherent to glass morphism. It's cosmetic and not worth breaking the design system over. The variation is barely noticeable in normal use.

### 35. Background Theme Swatches: Show Representative Color

When rendering color swatches for `BackgroundThemes`, show the **distinguishable** color — not the current dark/light mode color:

**Wrong:**
```tsx
const swatchColor = isDark ? theme.dark : theme.light;
// All light themes (paper, cream, sepia) look nearly black in dark mode
```

**Correct:**
```tsx
const swatchColor = theme.darkOnly ? theme.dark : theme.light;
// Dark-only themes show their dark color; dual-mode themes show their light color
```

This ensures users can tell themes apart regardless of current mode.

### 36. Reading Screen: Keep It Minimal

The reading screen should show ONLY what's essential for the reading experience:
- Word display (center)
- Word counter (e.g., "8 / 41")
- Navigation controls

**Removed:** Difficulty badges ("Beginner", "Intermediate", etc.) — they add visual noise without helping the reading experience. Difficulty info belongs on the text selection screen, not during reading.

### 37. Toast and ConfirmationDialog Components

**Toast** (`src/components/Toast.tsx` + `src/lib/store/toast.ts`):
- Glass morphism toast, auto-dismisses after 2s
- Use for success feedback: `showToast('Saved!', 'check')`
- Replaces `Alert.alert` for non-blocking success messages
- Rendered globally in `_layout.tsx`

**ConfirmationDialog** (`src/components/ConfirmationDialog.tsx`):
- Glass morphism overlay with confirm/cancel buttons
- Use for destructive actions (delete, remove) instead of system `Alert.alert`
- Props: `visible`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `destructive`

**When to use which:**
- Success feedback → Toast
- Destructive confirmation → ConfirmationDialog
- Error messages → Keep `Alert.alert` (blocking is appropriate)
- Multi-option menus (edit/delete/cancel) → Keep `Alert.alert` (ConfirmationDialog is binary)

### 38. FeatherIconName Type System

All Feather icon references use the `FeatherIconName` type from `src/types/icons.ts`:
```tsx
import type { FeatherIconName } from '../types/icons';
// No more `as any` on icon names
```

When adding new icon references:
- Use `FeatherIconName` for type annotations
- Use `'iconname' as const` for literal values that TypeScript can't infer
- For fallback values with `??`, annotate the variable: `const icon: FeatherIconName = lookup ?? 'award'`

### 39. Store Version & Migration Pattern (v27+)

Current store version: **27**. When adding new persisted fields:
1. Add to `SettingsState` interface
2. Add default value in the `set`/`get` creation block
3. Add to `resetAll` defaults
4. Bump `version` number
5. Add migration block: `if (version < N) { persisted.newField = persisted.newField ?? defaultValue; }`

Key fields added in v26:
- `hasRequestedReview: boolean` — one-time App Store review prompt tracking
- `discoveredFeatures: { definition, pronunciation, wordSave, tts }` — one-time feature tooltip tracking
- `lastWordReviewDate: string | null` — word bank review recency tracking
- `SavedWord.lastReviewedDate?: string` — per-word review recency (E3 smart ordering)

### 40. Level-Gated Cosmetics Pattern

Themes and colors can have `minLevel?: number` field:
- Free users must reach that level to unlock
- Premium users bypass level gates (same as `proAccessible` pattern)
- In `AppearanceSection.tsx`, check level lock BEFORE premium lock BEFORE reward lock
- Use `trending-up` icon for level-locked swatches (not `lock` or `award`)

### 41. "Replace, Don't Add" UI Principle

When adding new features to existing screens, REPLACE existing elements rather than stacking:
- **Completion screen:** "Words worth saving" chips REPLACE the nudge text, not in addition
- **Word bank:** Pronunciation stats MERGE into word count line, not a new section
- **Secondary actions:** "Practice Words" REPLACES "Read Again" (same footprint)
- **Home screen:** Max ONE contextual card at a time (resume > streak > review nudge)
- **Reading hints:** Feature tooltips use SAME hint slot as "Tap to continue"

### 42. Weekly Challenge System

12+ challenge types defined in `src/lib/data/challenges.ts`:
- Types: `texts_read`, `categories_diverse`, `quiz_perfect`, `words_total`, `pronunciation_perfect`, `listen_repeat`, `daily_goal`, `advanced`
- Challenges rotate deterministically by week number
- Progress tracked via `incrementWeeklyChallengeProgress(type, amount)` in store
- Advanced challenge: track in `complete.tsx` when `textDifficulty === 'advanced'`

### 43. Notification Functions Signature

`scheduleStreakReminder(hour, minute, currentStreak)` — takes 3 args, not 2.
`requestNotificationPermissions()` — returns `Promise<boolean>`.

### 44. Feature Discovery Tooltips Pattern

One-time tooltips in `reading.tsx` staggered by `textsCompleted`:
- 3rd text: definition (`?` button)
- 5th text: pronunciation (mic)
- 7th text: word save (heart)
- 10th text: TTS (speaker)

Uses same hint slot as "Tap to continue". Auto-dismiss after 5s. Track via `discoveredFeatures` in store.

### 45. Smart Flashcard Ordering (Word Bank)

Review order in `word-bank.tsx` is NOT insertion order. Priority:
1. Never-reviewed words (`lastReviewedDate` undefined)
2. Low pronunciation accuracy (`perfects/attempts < 0.5`)
3. Least recently reviewed
4. Everything else

Updates `lastReviewedDate` on flip. Tracks `lastWordReviewDate` in store for nudge timing.

### 46. Endgame Progression (Level 5+)

After Level 5 (10,000 words), progression doesn't cap:
- `getProgressToNextLevel()` shows progress toward next 10K milestone
- `getWordsToNextLevel()` shows words remaining to next 10K milestone
- `getTotalWordsLabel()` returns "X words mastered" for display
- Home screen should show total word count instead of "Level 5 — 100%"

### 47. expo-store-review Requires Native Rebuild

`expo-store-review` has native code. After adding it:
```bash
npx expo prebuild --clean && npx expo run:ios
```
In code: always wrap in try-catch and check `StoreReview.hasAction()` before calling `requestReview()`.

### 48. expo-file-system: Use New File API (SDK 55+)

`readAsStringAsync` from `expo-file-system` is **deprecated** in SDK 55. Using it shows a full deprecation warning on screen that can be mistaken for an error.

**Wrong:**
```ts
import * as FileSystem from 'expo-file-system';
await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
```

**Correct:**
```ts
import { File } from 'expo-file-system';
const file = new File(uri);
const base64 = await file.base64();
const text = await file.text();
```

Files migrated: `useRecording.ts`, `parseFile.ts`. Dead import removed from `pronunciation-service.ts`.

### 49. iOS Recording Requires setAudioModeAsync

`expo-audio` recording on iOS requires enabling recording mode BEFORE calling `prepareToRecordAsync()`.

```ts
import { setAudioModeAsync } from 'expo-audio';
await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
await audioRecorder.prepareToRecordAsync();
audioRecorder.record();
// After stop:
await setAudioModeAsync({ allowsRecording: false });
```

Without this, `record()` and `stop()` fail silently or crash on iOS.

### 50. Edge Function Deployment

Local edge function code in `supabase/functions/` must be **deployed** to take effect. Local changes don't auto-deploy.

```bash
npx supabase login  # First time only — opens browser auth
npx supabase functions deploy openai-proxy --project-ref mgwkhxlhhrvjgixptcnu
```

If the app shows "Unknown action" errors, the deployed version likely doesn't have the handler. Check local code vs deployed.

### 51. Review Card Transitions: Dismiss Before Advancing

When advancing flashcards or pronunciation drill cards, **always dismiss feedback/definition first, then advance the index after a delay**. Otherwise the new word renders while the old feedback/definition is still visible.

**Wrong:**
```ts
setReviewIndex((i) => i + 1);
setShowDefinition(false);
```

**Correct:**
```ts
setShowDefinition(false);
setTimeout(() => {
  setReviewIndex((i) => i + 1);
}, 150);
```

Same pattern for pronunciation drill — `drill.dismissFeedback()` then `setTimeout(() => setReviewIndex(...), 300)`.

### 52. Pronunciation Drill: User Tries First

The pronunciation drill should NOT auto-play TTS. The user should attempt pronunciation first, with an optional "Hear it" button if they need help.

Flow: show word → start recording immediately ("Your turn...") → score → show result.
The `listenToWord()` function on the drill hook lets UI offer an on-demand TTS button.

### 53. Library Has Separate Words View vs Word Bank Screen

`library.tsx` (Words tab) shows word list with "Read My Words" + "Review" buttons.
`word-bank.tsx` is the dedicated review screen with flashcards + pronunciation drill.
The library Review button navigates to `/word-bank`. Don't duplicate review UI in library.

### 54. Optical Vertical Centering (Nav Bar Compensation)

**Problem:** Content centered with `justifyContent: 'flex-start'` + `paddingTop: '30%'` sits too high, leaving dead space at the bottom.

**Wrong:**
```ts
container: {
  flex: 1,
  justifyContent: 'flex-start',
  paddingTop: '30%',  // top-heavy, dead space at bottom
}
```

**Correct:**
```ts
container: {
  flex: 1,
  justifyContent: 'center',
  paddingBottom: '12%',  // optical nudge upward
}
```

Screens with a nav bar eat top space, so true `center` feels slightly low. Use `paddingBottom` (not `paddingTop`) to nudge content upward. This gives balanced, optically centered layouts without hardcoded top offsets.
