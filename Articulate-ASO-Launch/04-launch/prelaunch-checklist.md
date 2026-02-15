# Pre-Launch Checklist - Articulate

**Target Launch Date:** February 27, 2026
**Platform:** Apple App Store (iOS only)
**Status:** 0/89 items complete
**Last Updated:** February 13, 2026

---

## Phase 1: App Store Connect Account & App Setup

- [ ] Apple Developer Program membership active and paid ($99/year)
- [ ] App Store Connect account accessible at appstoreconnect.apple.com
- [ ] New app created in App Store Connect (+ button > New App)
- [ ] Bundle ID registered: `com.articulate.app`
- [ ] Platform selected: iOS
- [ ] Primary language set: English (U.S.)
- [ ] App name reserved: `Articulate: One Word Reader`

---

## Phase 2: App Store Metadata

### Title & Subtitle
- [ ] Title finalized: `Articulate: One Word Reader` (27/30 chars)
- [ ] Subtitle finalized: `Read Faster, Learn New Words` (28/30 chars)
- [ ] Both entered in App Store Connect > App Information > Localizable Information

### Keywords
- [ ] Keyword string entered (no spaces after commas): `rsvp,speed read,dyslexia,comprehension,vocabulary,flashcard,streak,pronunciation,focus,wpm,literacy` (99/100 chars)
- [ ] Verified no words duplicated from title or subtitle
- [ ] Entered in version page > Keywords field

### Description
- [ ] Full description written (3,033/4,000 chars)
- [ ] Spell-checked and proofread
- [ ] All features mentioned match what the app actually does at launch
- [ ] "Free vs Premium" section accurately reflects current gating
- [ ] Pasted into App Store Connect version page > Description

### Promotional Text
- [ ] Promotional text written (168/170 chars)
- [ ] Pasted into App Store Connect version page > Promotional Text
- [ ] (Note: can be updated anytime without a new build)

### What's New
- [ ] "What's New" text written for version 1.0 (e.g., "Welcome to Articulate! Read one word at a time, build your vocabulary, and track your progress.")
- [ ] Pasted into version page > What's New

### URLs & Contact
- [ ] Support URL set: `https://articulate-ashy.vercel.app/privacy.html` (or dedicated support page)
- [ ] Privacy Policy URL set: `https://articulate-ashy.vercel.app/privacy.html`
- [ ] Marketing URL set (optional -- add if landing page exists)
- [ ] Support email confirmed working: `admin@ordco.net`
- [ ] Test that support URL loads correctly in a browser

---

## Phase 3: Visual Assets

### App Icon
- [ ] Icon designed at 1024x1024px
- [ ] Format: PNG, no transparency, no alpha channel
- [ ] No rounded corners applied (Apple masks automatically)
- [ ] Tested at small sizes (29x29, 40x40, 60x60) -- still recognizable
- [ ] Tested against light and dark wallpapers
- [ ] Uploaded to App Store Connect (App Information > General > App Icon)

### Screenshots
- [ ] 6.9" display screenshots created (1320 x 2868px) -- REQUIRED for 16 Pro Max
- [ ] 6.7" display screenshots created (1290 x 2796px) -- REQUIRED
- [ ] Minimum 3 screenshots per size, recommended 6-8
- [ ] Screenshot 1: RSVP reading (one word displayed) -- "Read One Word at a Time"
- [ ] Screenshot 2: Speed control / WPM adjustment -- "Your Speed, Your Pace"
- [ ] Screenshot 3: Curated library (30+ texts) -- "30+ Curated Texts to Explore"
- [ ] Screenshot 4: AI comprehension quiz -- "Test Your Comprehension with AI"
- [ ] Screenshot 5: Word bank / flashcards -- "Build Your Vocabulary"
- [ ] Screenshot 6: Custom text import -- "Import Any Text You Want"
- [ ] Screenshot 7: Streaks and progress -- "Track Your Reading Habit"
- [ ] Screenshot 8: Accessibility and themes -- "Designed for Every Reader"
- [ ] All screenshots use consistent visual style (background, typography, frames)
- [ ] Caption text is 4 words or fewer, readable at small sizes
- [ ] No placeholder text, real names, or sensitive data visible
- [ ] Screenshots show actual app UI (not mockups of unbuilt features)
- [ ] All screenshots uploaded to App Store Connect in correct size slots

### App Preview Video (Optional -- skip if time is tight)
- [ ] 15-30 second video showing RSVP reading mechanic
- [ ] H.264 codec, .mov or .mp4, 30fps
- [ ] Resolution matches screenshot sizes
- [ ] Text overlays/captions added (most users watch muted)
- [ ] Uploaded to App Store Connect

---

## Phase 4: Categories & Age Rating

### Categories
- [ ] Primary category set: Education
- [ ] Secondary category set: Books
- [ ] Both selected in App Store Connect > App Information > General

### Age Rating
- [ ] Age rating questionnaire completed in App Store Connect
- [ ] Expected rating: 4+ (no objectionable content, no user-generated content shared publicly, no gambling, no horror, no mature themes)
- [ ] Verified questionnaire answers match app content:
  - Cartoon or Fantasy Violence: None
  - Realistic Violence: None
  - Sexual Content or Nudity: None
  - Profanity or Crude Humor: None -- NOTE: curated texts (poetry, philosophy) are all clean
  - Alcohol, Tobacco, or Drug Use or References: None
  - Simulated Gambling: None
  - Horror/Fear Themes: None
  - Medical/Treatment Information: None
  - Unrestricted Web Access: No
  - Gambling with Real Currency: No

---

## Phase 5: Legal & Compliance

### Privacy Policy
- [ ] Privacy policy published at a publicly accessible URL
- [ ] URL loads correctly: `https://articulate-ashy.vercel.app/privacy.html`
- [ ] Privacy policy accurately describes data practices:
  - All data stored locally on device (MMKV)
  - Audio recordings for pronunciation sent to OpenAI via Supabase (not stored)
  - Text content sent to OpenAI for quiz generation (not stored)
  - No user accounts, no personal data collected
  - No third-party analytics tracking
  - RevenueCat processes subscription data
- [ ] GDPR considerations addressed (data stays on device, no EU-specific concerns)
- [ ] CCPA considerations addressed (no personal information sold)

### Terms of Service
- [ ] Terms of service published (recommended but not strictly required for free apps)
- [ ] URL accessible and linked if applicable

### App Privacy (Apple Nutrition Labels)
- [ ] App Privacy section completed in App Store Connect > App Information > App Privacy
- [ ] Data types declared accurately:
  - Purchases: subscription status (linked to user via RevenueCat anonymous ID)
  - Audio data: microphone recordings sent to server for pronunciation scoring (not linked to user, not stored)
  - Usage data: none collected externally (all local)
  - Diagnostics: crash logs if using default Apple crash reporting
- [ ] "Data Not Collected" selected for categories where no data leaves the device

### Export Compliance
- [ ] `ITSAppUsesNonExemptEncryption` set to `false` in app.json (already done)
- [ ] App uses only standard HTTPS (exempt from export compliance)
- [ ] Export compliance question answered "No" in App Store Connect

### Content Rights
- [ ] Confirmed rights to all curated texts (public domain, licensed, or original)
- [ ] Content rights declaration completed in App Store Connect
- [ ] If using public domain texts: documented source and verified public domain status

---

## Phase 6: Subscription Setup (RevenueCat + App Store Connect)

### App Store Connect Subscriptions
- [ ] Subscription group created in App Store Connect (App > Subscriptions)
- [ ] Group name set (e.g., "Articulate Premium")
- [ ] Monthly subscription product created:
  - Reference name (internal)
  - Product ID (matches RevenueCat configuration)
  - Subscription duration: 1 month
  - Price set for all territories
  - Subscription description written
- [ ] Lifetime (non-renewing or non-consumable) product created:
  - Reference name (internal)
  - Product ID (matches RevenueCat configuration)
  - Price set for all territories
- [ ] All subscription localizations filled in (display name, description)
- [ ] Subscription status URL configured (if using server notifications)
- [ ] Review information provided (reviewer instructions for testing premium features)

### RevenueCat Integration
- [ ] RevenueCat dashboard configured with correct App Store Connect API key
- [ ] Product IDs in RevenueCat match App Store Connect product IDs exactly
- [ ] Offerings configured (which products shown to which users)
- [ ] Tested purchase flow in sandbox environment
- [ ] Tested restore purchases flow
- [ ] Tested subscription expiration and renewal in sandbox
- [ ] Verified paywall displays correct prices from RevenueCat
- [ ] Sandbox tester account created in App Store Connect (Users and Access > Sandbox Testers)

### Pricing
- [ ] Pricing tiers selected for all territories
- [ ] Tax information completed in App Store Connect (Agreements, Tax, and Banking)
- [ ] Banking information added (required to receive subscription revenue)
- [ ] Paid Applications agreement accepted in App Store Connect

---

## Phase 7: Technical Readiness

### Build & Binary
- [ ] Final production build created: `npx expo prebuild --clean && npx expo run:ios --configuration Release`
- [ ] Or: EAS Build production profile configured and build submitted
- [ ] Build uploaded to App Store Connect (via Xcode Organizer or Transporter)
- [ ] Build processed successfully (check Processing status in App Store Connect)
- [ ] No build processing errors or warnings
- [ ] Build number is `1` and version is `1.0.0`

### TestFlight Testing
- [ ] Internal testing: build distributed to internal testers via TestFlight
- [ ] Core reading flow tested: select text > read > complete
- [ ] Speed adjustment tested (100 WPM to 600+ WPM)
- [ ] AI quiz flow tested: complete text > take quiz > see results
- [ ] Pronunciation drill tested: record > transcribe > score
- [ ] Word bank tested: save word > review flashcard > pronunciation drill
- [ ] Custom text import tested: paste text > read
- [ ] Camera/image scan tested (if included in v1)
- [ ] Streak system tested: read on consecutive days, verify increment
- [ ] Weekly challenges tested: progress tracking works
- [ ] All fonts render correctly (Source Serif, Literata, JetBrains, System, OpenDyslexic)
- [ ] All themes render correctly (light, dark, paper, cream, sepia, midnight, etc.)
- [ ] Free tier limits tested: 1 custom text/day, 1 quiz/day, 2 definitions/day, 3 pronunciations/day
- [ ] Paywall tested: triggers correctly for locked features
- [ ] Subscription purchase tested in sandbox: monthly and lifetime
- [ ] Restore purchases tested in sandbox
- [ ] External TestFlight testing (optional, 2-5 trusted testers for fresh perspective)

### Crash & Performance
- [ ] No crashes in TestFlight crash reports
- [ ] App launch time under 3 seconds on oldest supported device
- [ ] Memory usage reasonable (no leaks during extended reading sessions)
- [ ] Tested on multiple iOS versions (iOS 16+, or whatever minimum is set)
- [ ] Tested on both iPhone SE (small screen) and iPhone 16 Pro Max (large screen)
- [ ] Tested in airplane mode (app should work offline except AI features)
- [ ] Tested with VoiceOver enabled (basic accessibility)
- [ ] Tested with Dynamic Type (text scales appropriately)

### Edge Cases
- [ ] App handles no internet gracefully (quiz/pronunciation show clear error)
- [ ] App handles interrupted recording gracefully (phone call during pronunciation)
- [ ] App handles backgrounding and foregrounding (state preserved)
- [ ] App handles low storage gracefully
- [ ] Notification permissions flow works (streak reminders)
- [ ] Deep link / URL scheme works if configured

---

## Phase 8: App Review Preparation

### Review Information
- [ ] App Review contact information provided (name, phone, email)
- [ ] Demo instructions written for reviewer:
  - "Tap any category to browse texts. Select a text and tap Play to begin reading. Words appear one at a time. After finishing, take the comprehension quiz. Save words to your word bank for flashcard review."
- [ ] If subscription required for full review: provide sandbox test account credentials
- [ ] Notes field filled with anything the reviewer should know:
  - "Microphone is used for pronunciation practice only. Audio is sent to OpenAI for transcription and is not stored."
  - "Camera is used for text scanning (OCR) only."

### Common Rejection Reasons to Pre-Check
- [ ] No broken links (privacy policy URL, support URL)
- [ ] No placeholder content ("Lorem ipsum", "Coming soon")
- [ ] No misleading screenshots (screenshots match actual app)
- [ ] Subscription terms clearly displayed before purchase
- [ ] "Restore Purchases" button visible and functional
- [ ] App does not crash on launch
- [ ] All permission requests have clear purpose strings (microphone, camera, photos)
- [ ] No references to other platforms ("Also available on Android")
- [ ] No pricing information in screenshots (prices vary by region)
- [ ] Age rating matches content
- [ ] App provides value in free tier (not a paywall-only shell)

---

## Phase 9: Marketing Preparation (Do What You Can)

### MUST HAVE
- [ ] App website or landing page live (even a simple one-pager)
- [ ] Support email working and monitored: `admin@ordco.net`
- [ ] App Store URL ready to share once approved (short link or pre-order link)

### NICE TO HAVE (if time allows)
- [ ] Social media announcement drafted (Twitter/X, Reddit, ProductHunt)
- [ ] r/iOSProgramming, r/speedreading, r/ADHD, r/dyslexia posts planned
- [ ] ProductHunt launch planned (can be post-launch)
- [ ] Press kit assembled (icon, screenshots, one-paragraph description)
- [ ] Launch day email to any existing mailing list
- [ ] Friends/family asked to download and leave honest reviews on launch day

---

## Phase 10: Analytics & Monitoring Setup

- [ ] App Store Connect analytics accessible (automatically available)
- [ ] RevenueCat dashboard bookmarked for subscription monitoring
- [ ] Crash monitoring ready (Xcode Organizer crash logs, or Firebase Crashlytics if integrated)
- [ ] Supabase dashboard accessible for edge function monitoring (quiz generation, pronunciation)
- [ ] Supabase edge function `openai-proxy` deployed and working in production
- [ ] OpenAI API key has sufficient credits for launch traffic

---

## Phase 11: Day-of-Launch Tasks

- [ ] Verify app is live on App Store (search for it, check direct link)
- [ ] Download the app from the App Store on a real device (not TestFlight)
- [ ] Complete a full user flow: onboard > read > quiz > save word > review
- [ ] Test subscription purchase on live App Store (can refund within 14 days)
- [ ] Share App Store link on all channels
- [ ] Monitor App Store Connect for first downloads
- [ ] Monitor reviews (App Store Connect > Ratings and Reviews)
- [ ] Monitor crash reports (App Store Connect > Analytics > Crashes)
- [ ] Monitor Supabase edge function logs (quiz/pronunciation working?)
- [ ] Respond to any reviews within 24 hours

---

## Phase 12: Post-Launch Monitoring (First 48 Hours)

- [ ] Check downloads hourly for the first day, then every few hours
- [ ] Respond to every review (use templates from review-responses.md)
- [ ] Monitor crash-free rate (target: 99%+)
- [ ] Monitor Supabase function invocations (any errors? rate limits?)
- [ ] Check OpenAI API usage (unexpected costs?)
- [ ] Verify subscription flow works for real users (check RevenueCat dashboard)
- [ ] Note any user feedback patterns (bugs, confusion, feature requests)
- [ ] If critical bug found: prepare hotfix build immediately

---

## Phase 13: First Week Post-Launch

- [ ] Daily review responses (every review within 24 hours)
- [ ] Analyze which keywords are driving impressions (App Store Connect > Analytics)
- [ ] Check conversion rate (impressions to product page views to installs)
- [ ] Identify top user complaints or confusion points
- [ ] Plan version 1.1 with any critical fixes
- [ ] If stable: request friends/family leave App Store reviews
- [ ] Update promotional text based on early feedback or seasonal angle
- [ ] Share any positive reviews on social media

---

## Summary

**Total Items:** 89
**Completed:** 0
**Remaining:** 89

**Phase Priority for 2-Week Timeline:**
1. CRITICAL (must complete): Phases 1-2-3-5-6-7-8 (account, metadata, screenshots, legal, subscriptions, testing, review prep)
2. HIGH (complete if possible): Phases 4, 10, 11 (categories, analytics, launch day)
3. NICE TO HAVE: Phase 9 (marketing), Phase 12-13 (post-launch monitoring happens naturally)

**Estimated Time to Complete All Items:** 50-70 hours over 14 days
**Average Daily Commitment:** 4-5 hours/day

---

**Status Key:**
- [ ] = Not started
- [x] = Complete
- Items marked with (optional) can be skipped if time is tight
