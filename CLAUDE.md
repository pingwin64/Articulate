# Articulate - Project Guidelines

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
  version: 1,  // increment when schema changes
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

## Navigation

- **index** — Home (onboarding for new users)
- **reading** — Main reading screen (`headerShown: true`, transparent header, `Stack.Toolbar` at bottom)
- **complete** — Post-reading celebration
- **settings** — `slide_from_right`, large title header
- **text-select** — `formSheet`, grabber visible, detents `[0.5, 1.0]`
- **paywall** — `formSheet`, detents `[0.75, 1.0]`
- **quiz** — Comprehension quiz
- **paste** — Custom text input

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

**Free features:** sourceSerif font, default color, default background, 3 core categories (story, article, speech), 1 custom text
**Premium features:** all fonts, all colors, all backgrounds, all categories, unlimited custom texts, TTS, auto-play, chunk reading, breathing animation, quizzes

When gating a feature for free users:
- Show the control/button but trigger `setPaywallContext('locked_*')` on interaction
- Use appropriate `PaywallContext` string for tracking

## Content System

Categories and texts are defined in `src/lib/data/categories.ts`. All content is bundled locally (no network fetches). Words are pre-split into `string[]` arrays.

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
