# 24-Hour Custom Text Limit for Free Users

## Overview
Free users can have **1 custom text** at a time (pasted, scanned, or imported). After 24 hours, it auto-deletes, and they can add another.

---

## Current State
- `dailyUploadDate` / `dailyUploadUsed` - tracks if user uploaded today (resets at midnight)
- `customTexts[]` - array of all custom texts
- Each `CustomText` has `createdAt` timestamp

## New Behavior

| User Type | Custom Texts | Duration |
|-----------|--------------|----------|
| Free | 1 at a time | 24 hours, then auto-delete |
| Premium | Unlimited | Forever |

---

## Implementation Plan

### 1. Add Cleanup Function to Store
**File:** `src/lib/store/settings.ts`

```typescript
// New function: cleanupExpiredFreeTexts
cleanupExpiredFreeTexts: () => {
  const state = get();
  if (state.isPremium) return; // Premium users keep everything

  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  const expiredIds = state.customTexts
    .filter(t => {
      const createdTime = new Date(t.createdAt).getTime();
      return now - createdTime > TWENTY_FOUR_HOURS;
    })
    .map(t => t.id);

  if (expiredIds.length > 0) {
    set({
      customTexts: state.customTexts.filter(t => !expiredIds.includes(t.id))
    });
  }
}
```

### 2. Add Helper: Check If Free User Can Upload
**File:** `src/lib/store/settings.ts`

```typescript
// New function: canFreeUserUpload
canFreeUserUpload: () => {
  const state = get();
  if (state.isPremium) return true;

  // Free users can only have 1 text at a time
  // Check if they have any non-expired texts
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  const activeTexts = state.customTexts.filter(t => {
    const createdTime = new Date(t.createdAt).getTime();
    return now - createdTime < TWENTY_FOUR_HOURS;
  });

  return activeTexts.length === 0;
}
```

### 3. Add Helper: Get Time Until Next Upload
**File:** `src/lib/store/settings.ts`

```typescript
// New function: getFreeTextExpiry
getFreeTextExpiry: () => {
  const state = get();
  if (state.isPremium) return null;
  if (state.customTexts.length === 0) return null;

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const oldestText = state.customTexts[0]; // Assuming sorted by createdAt
  const createdTime = new Date(oldestText.createdAt).getTime();
  const expiryTime = createdTime + TWENTY_FOUR_HOURS;
  const now = Date.now();

  if (now >= expiryTime) return 0; // Already expired
  return expiryTime - now; // Milliseconds until expiry
}
```

### 4. Run Cleanup on App Start
**File:** `src/app/_layout.tsx`

In the root layout's useEffect, call cleanup:
```typescript
useEffect(() => {
  // Clean up expired free user texts
  useSettingsStore.getState().cleanupExpiredFreeTexts();
}, []);
```

### 5. Update Upload Screens
**Files:**
- `src/app/paste.tsx`
- `src/app/scan.tsx` (if exists)
- Any file import handlers

**Before allowing upload:**
```typescript
const canUpload = canFreeUserUpload();
const expiry = getFreeTextExpiry();

if (!canUpload && !isPremium) {
  // Show message: "Your free text expires in X hours. Upgrade for unlimited."
  // Or trigger paywall with context 'custom_text_limit'
}
```

### 6. Update Library Screen
**File:** `src/app/library.tsx`

Show expiry countdown for free users:
```typescript
// For each custom text (free users only have 1)
const expiry = getFreeTextExpiry();
if (expiry && !isPremium) {
  const hoursLeft = Math.ceil(expiry / (60 * 60 * 1000));
  // Show: "Expires in {hoursLeft}h" badge on the text
}
```

### 7. Update Paste Screen Messaging
**File:** `src/app/paste.tsx`

Show clear messaging about the limit:
- Free users: "This text will be available for 24 hours"
- After that: "Upgrade for unlimited texts that never expire"

---

## UI Changes

### Paste/Scan Screen (Free User)
```
┌─────────────────────────────────┐
│  Your text (24h access)         │
│                                 │
│  [Text input area]              │
│                                 │
│  ─────────────────────────────  │
│  Free: 1 text for 24 hours      │
│  Upgrade for unlimited →        │
└─────────────────────────────────┘
```

### Library Screen (Free User with Active Text)
```
┌─────────────────────────────────┐
│  My Texts                       │
│                                 │
│  ┌─────────────────────────┐    │
│  │ "Article Title"         │    │
│  │ 523 words              │    │
│  │ ⏱ Expires in 18h       │    │
│  └─────────────────────────┘    │
│                                 │
│  Want unlimited texts?          │
│  [Upgrade to Pro]               │
└─────────────────────────────────┘
```

### Paste Screen (Free User Already Has Text)
```
┌─────────────────────────────────┐
│  You already have a text        │
│                                 │
│  Your current text expires in   │
│  6 hours. Come back then, or    │
│  upgrade for unlimited texts.   │
│                                 │
│  [View My Text]  [Upgrade]      │
└─────────────────────────────────┘
```

---

## Files to Modify

1. `src/lib/store/settings.ts`
   - Add `cleanupExpiredFreeTexts()`
   - Add `canFreeUserUpload()`
   - Add `getFreeTextExpiry()`

2. `src/app/_layout.tsx`
   - Call cleanup on mount

3. `src/app/paste.tsx`
   - Check if user can upload
   - Show 24h messaging
   - Block if already has active text

4. `src/app/library.tsx`
   - Show expiry countdown badge
   - Update empty state messaging

5. `src/app/index.tsx` (if paste button exists there)
   - Check before navigating to paste

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User upgrades to Premium | Keep all texts, no expiry |
| User downgrades from Premium | Existing texts stay, new limit applies |
| User has text, goes offline for 24h+ | Cleanup runs on next app open |
| User reads text just before expiry | Text still deletes (reading doesn't extend) |
| Multiple texts from before this feature | Clean up all but newest on first run |

---

## Migration

For existing free users with multiple texts:
- Keep the **most recently created** text
- Delete all others
- Show a one-time message explaining the change (optional)

---

## Verification Checklist

- [ ] Free user can paste/scan 1 text
- [ ] Free user cannot add second text while first is active
- [ ] Text auto-deletes after 24 hours
- [ ] Expiry countdown shows correctly
- [ ] Premium users unaffected (unlimited, no expiry)
- [ ] Cleanup runs on app start
- [ ] Paywall shows when blocked with correct context
