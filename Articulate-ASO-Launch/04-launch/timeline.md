# Launch Timeline - Articulate

**Launch Target:** Thursday, February 26, 2026 (submit to Apple)
**Expected Approval:** Saturday-Monday, February 28 - March 2, 2026
**Public on App Store:** By Monday, March 2, 2026 (latest)
**Today's Date:** Friday, February 13, 2026
**Days to Submission:** 13 days
**Developer:** Solo (one person)

---

## Timeline Overview

| Phase | Dates | Focus | Hours |
|-------|-------|-------|-------|
| Phase 1 | Feb 13-15 (Fri-Sun) | Metadata, legal, account setup | 10-12h |
| Phase 2 | Feb 16-18 (Mon-Wed) | Screenshots, icon, visual assets | 10-14h |
| Phase 3 | Feb 19-21 (Thu-Sat) | Subscriptions, testing, bug fixes | 12-15h |
| Phase 4 | Feb 22-24 (Sun-Tue) | Final testing, polish, review prep | 8-10h |
| Phase 5 | Feb 25-26 (Wed-Thu) | Submit to Apple | 3-4h |
| Phase 6 | Feb 27-Mar 2 (Fri-Mon) | Wait for review, prepare launch | 2-3h |
| Phase 7 | Mar 2-8 | First week live | 1-2h/day |

**Total estimated effort:** 50-60 hours over 17 days

---

## Phase 1: Foundation (February 13-15, 2026)

### Friday, February 13 -- TODAY

**Priority: Get the administrative and legal work done first. These are the most common blockers.**

**Morning (2-3 hours):**
- [ ] Log into App Store Connect (appstoreconnect.apple.com)
- [ ] Verify Apple Developer Program membership is active
- [ ] Create new app in App Store Connect:
  - Platform: iOS
  - Name: `Articulate: One Word Reader`
  - Primary Language: English (U.S.)
  - Bundle ID: `com.articulate.app`
  - SKU: `articulate-ios-v1`
- [ ] Check Agreements, Tax, and Banking section:
  - Paid Applications agreement signed
  - Tax forms completed
  - Bank account added (required for subscription revenue)
  - WARNING: Banking/tax setup can take 24-48 hours to verify. Start TODAY.

**Afternoon (2-3 hours):**
- [ ] Review and update privacy policy at `https://articulate-ashy.vercel.app/privacy.html`
  - Verify it covers: local data storage, microphone usage for pronunciation, camera for text scanning, OpenAI data processing, RevenueCat subscription handling
  - Verify the page loads correctly
- [ ] Complete App Privacy section in App Store Connect (nutrition labels)
- [ ] Complete Export Compliance (answer "No" -- app uses only HTTPS)
- [ ] Enter all metadata in App Store Connect:
  - Title: `Articulate: One Word Reader`
  - Subtitle: `Read Faster, Learn New Words`
  - Keywords: `rsvp,speed read,dyslexia,comprehension,vocabulary,flashcard,streak,pronunciation,focus,wpm,literacy`
  - Description: paste full description from apple-metadata.md
  - Promotional text: paste from apple-metadata.md
  - What's New: "Welcome to Articulate! Read one word at a time, build vocabulary, and track your reading progress."
  - Support URL: `https://articulate-ashy.vercel.app/privacy.html`
  - Privacy Policy URL: `https://articulate-ashy.vercel.app/privacy.html`
- [ ] Set categories: Primary = Education, Secondary = Books
- [ ] Complete Age Rating questionnaire (expect: 4+)

### Saturday, February 14

**Subscriptions and RevenueCat (3-4 hours):**
- [ ] Create subscription group in App Store Connect: "Articulate Premium"
- [ ] Create monthly subscription product:
  - Product ID matching RevenueCat (e.g., `articulate_monthly`)
  - Set pricing tier for all territories
  - Write subscription display name and description
- [ ] Create lifetime purchase product:
  - Product ID matching RevenueCat (e.g., `articulate_lifetime`)
  - Set pricing tier
- [ ] Verify RevenueCat dashboard:
  - App Store Connect API key configured
  - Product IDs match exactly
  - Offerings configured correctly
- [ ] Create sandbox tester account in App Store Connect (Users and Access > Sandbox Testers)
- [ ] Test sandbox purchase on device (monthly subscription)
- [ ] Test sandbox restore purchases
- [ ] Verify paywall shows correct prices

**Content Rights Audit (1 hour):**
- [ ] Audit all 30+ curated texts -- confirm each is public domain or properly licensed
- [ ] Document source for each text (keep record for potential Apple review questions)
- [ ] Complete Content Rights declaration in App Store Connect

### Sunday, February 15

**TestFlight Setup and First Build (3-4 hours):**
- [ ] Build production binary: `npx expo prebuild --clean` then build via Xcode or EAS
- [ ] Upload build to App Store Connect (via Xcode Organizer or `eas submit`)
- [ ] Wait for build processing (typically 15-60 minutes)
- [ ] Distribute build via TestFlight (internal testing)
- [ ] Install via TestFlight on your primary device
- [ ] Run through complete user flow:
  - Onboarding
  - Select category and text
  - Read at various speeds
  - Complete text, take quiz
  - Save a word, review in word bank
  - Flashcard review
  - Pronunciation drill
  - Custom text paste
  - Check streaks and profile
  - Trigger paywall, test subscription (sandbox)
- [ ] Note any bugs or issues for fixing in Phase 3

---

## Phase 2: Visual Assets (February 16-18, 2026)

### Monday, February 16

**App Icon Finalization (1-2 hours):**
- [ ] Verify app icon is 1024x1024px, PNG, no transparency
- [ ] Test icon at small sizes (29px, 40px, 60px) -- still recognizable?
- [ ] Test against light and dark backgrounds
- [ ] Upload to App Store Connect

**Screenshot Planning (2-3 hours):**
- [ ] Take raw screenshots from TestFlight build on Simulator or device:
  - iPhone 16 Pro Max (6.9" -- 1320x2868)
  - iPhone 15 Pro Max (6.7" -- 1290x2796)
- [ ] Screenshots to capture:
  1. RSVP reading screen (word displayed center, clean background)
  2. Speed adjustment visible
  3. Home screen / category selection (library view)
  4. Quiz screen (question + answer options)
  5. Flashcard review screen
  6. Custom text import screen
  7. Streaks / profile / achievements
  8. Theme / font picker (showing OpenDyslexic)
- [ ] Choose screenshot tool: Figma template, Rotato, or Screenshots Pro (shotbot.io)

### Tuesday, February 17

**Screenshot Creation (4-6 hours):**
- [ ] Design screenshot template in chosen tool:
  - Consistent background color/gradient (dark recommended for reading apps)
  - Caption placement (top, bold, 4 words max)
  - Device frame style (iPhone 15/16 Pro Max, thin or frameless)
- [ ] Create all 6-8 screenshots for 6.9" size
- [ ] Create all 6-8 screenshots for 6.7" size (may be able to scale/adapt from 6.9")
- [ ] Review all screenshots:
  - First screenshot shows RSVP reading (the hook)
  - Captions readable at search result thumbnail size
  - Consistent visual style across all screenshots
  - No placeholder text, real names, or sensitive data

### Wednesday, February 18

**Upload and Polish (2-3 hours):**
- [ ] Upload all screenshots to App Store Connect
  - 6.9" screenshots in the 6.9" slot
  - 6.7" screenshots in the 6.7" slot
- [ ] Preview how they look in App Store Connect preview
- [ ] App Preview Video (ONLY if time allows -- skip if behind schedule):
  - Screen record the reading flow (15-25 seconds)
  - Add caption overlays
  - Export at correct resolution
  - Upload to App Store Connect
- [ ] Review entire App Store listing in preview mode -- read everything as a potential user would

---

## Phase 3: Testing & Bug Fixes (February 19-21, 2026)

### Thursday, February 19

**Systematic QA Testing (4-5 hours):**

Core Flows:
- [ ] Fresh install experience (delete app, reinstall from TestFlight)
- [ ] Onboarding flow start to finish
- [ ] Read 3 different texts (short, medium, long)
- [ ] Speed adjustment: 100 WPM, 300 WPM, 600 WPM
- [ ] Complete a text and take quiz
- [ ] Save 5+ words to word bank
- [ ] Flashcard review (flip all cards)
- [ ] Pronunciation drill (record, get score)

Subscription Flows:
- [ ] Paywall appears at correct triggers (locked fonts, locked categories, etc.)
- [ ] Monthly subscription purchase (sandbox)
- [ ] Restore purchases works
- [ ] Premium features unlock after purchase
- [ ] Free tier limits enforce correctly (1 text/day, 1 quiz/day, 2 definitions/day)

### Friday, February 20

**Edge Case Testing (3-4 hours):**
- [ ] Airplane mode: app works for reading, clear errors for AI features
- [ ] Background/foreground: reading state preserved
- [ ] Interrupt during recording: phone call, notification
- [ ] Kill app during reading: resume correctly?
- [ ] Very long text: performance OK?
- [ ] Empty states: no saved words, no completed texts
- [ ] Accessibility: VoiceOver on, navigate main screens
- [ ] Dynamic Type: increase text size, verify readability
- [ ] Test on oldest supported iOS version (Simulator)
- [ ] Test on iPhone SE size (Simulator) -- layouts OK?

**Bug Fix Sprint (remaining hours):**
- [ ] Fix all critical bugs found during testing
- [ ] Fix all UI issues found during testing
- [ ] Deprioritize cosmetic issues that do not affect functionality

### Saturday, February 21

**Final Build and Soak Test (3-4 hours):**
- [ ] Build final production binary with all bug fixes
- [ ] Upload new build to App Store Connect
- [ ] Distribute via TestFlight
- [ ] Complete one full happy-path test: onboard > read > quiz > save word > review
- [ ] Leave app running in background for several hours -- any crashes?
- [ ] Verify Supabase edge function `openai-proxy` is deployed and working in production
- [ ] Verify OpenAI API key has sufficient credits
- [ ] Check that streak reminder notifications work

---

## Phase 4: Final Polish (February 22-24, 2026)

### Sunday, February 22

**App Review Preparation (2-3 hours):**
- [ ] Fill in App Review Information in App Store Connect:
  - Contact info: name, phone number, email
  - Demo account: not needed (app works without login)
  - Notes for reviewer:
    ```
    Articulate displays one word at a time for focused reading.

    To test: Tap any category > Select a text > Tap to start reading.
    After finishing, take the comprehension quiz.
    Save words to your word bank for flashcard review.

    Microphone permission: Used for pronunciation practice only.
    Camera permission: Used for scanning text from images.
    Photo library: Used for scanning text from saved images.

    Audio recordings are sent to OpenAI for transcription via our
    server and are not stored. No user account is required.
    All reading data is stored locally on the device.
    ```
- [ ] Verify all App Store Connect fields are filled (no missing required fields)
- [ ] Preview entire listing one more time

### Monday, February 23

**Rejection-Proofing (2-3 hours):**
- [ ] Test all URLs in App Store Connect listing -- do they load?
- [ ] Verify "Restore Purchases" button is accessible and works
- [ ] Verify subscription terms are shown before purchase (Apple requires this)
- [ ] Verify app provides meaningful value in free tier (not paywall-only)
- [ ] Verify all permission request strings are descriptive:
  - Microphone: "Allow Articulate to use your microphone to practice pronunciation."
  - Camera: "Allow Articulate to use your camera to scan text from photos."
  - Photos: "Allow Articulate to access your photos to scan text from images."
  - Notifications: must have a clear purpose string
- [ ] Check for any "Coming Soon" or placeholder text in the app
- [ ] Check for any debug/development UI left in the app
- [ ] Verify the app does not crash on launch (test 5 cold starts)

### Tuesday, February 24

**Pre-Submission Checklist (2-3 hours):**
- [ ] Select the final build in App Store Connect version page
- [ ] All metadata fields filled and reviewed
- [ ] All screenshots uploaded and in correct order
- [ ] App icon uploaded
- [ ] Content Rights completed
- [ ] Age Rating completed
- [ ] App Review Information completed
- [ ] Pricing and Availability configured:
  - Price: Free (with in-app purchases)
  - Availability: All territories (or selected territories)
  - Release: "Manually release this version" (recommended so you control the exact launch moment)
- [ ] Run through App Store Connect's "Submit for Review" pre-check (it will flag missing items)

---

## Phase 5: Submission (February 25-26, 2026)

### Wednesday, February 25

**Submit for Review (1-2 hours):**
- [ ] Final review of all App Store Connect fields
- [ ] Click "Submit for Review" in App Store Connect
- [ ] Answer any additional questions Apple asks during submission
- [ ] Status should change to "Waiting for Review"
- [ ] Note the submission time (for tracking review duration)

**While Waiting -- Prepare Launch (2 hours):**
- [ ] Draft social media announcement posts:
  - Twitter/X: short hook + App Store link
  - Reddit: r/iOSProgramming, r/speedreading, r/productivity, r/ADHD
  - Hacker News: Show HN post (if appropriate)
- [ ] Prepare email to friends/family asking for honest reviews
- [ ] Set up App Store Connect notifications (email alerts for review status changes)

### Thursday, February 26

**Monitor Review Status:**
- [ ] Check App Store Connect status periodically (status changes: Waiting for Review > In Review > Pending Developer Release or Approved)
- [ ] Be available for Apple's questions (they may ask for clarification)
- [ ] If rejected: read rejection reason carefully, fix the issue, resubmit same day
- [ ] Keep phone notifications on for App Store Connect emails

---

## Phase 6: Review Period (February 27 - March 2, 2026)

**Typical Apple review time: 24-48 hours. Can be faster (same day) or slower (up to 5 days).**

### If Approved with "Manually Release":

- [ ] Verify listing looks correct in App Store (preview via direct link)
- [ ] When ready: click "Release This Version" in App Store Connect
- [ ] App goes live within minutes of release

### If Rejected:

Most common rejection reasons for Education apps:
1. **Missing subscription restore button** -- add "Restore Purchases" if missing
2. **Subscription terms not shown** -- ensure terms visible before purchase
3. **Misleading metadata** -- screenshots must match actual app
4. **Broken URLs** -- privacy policy or support URL returns 404
5. **Insufficient free functionality** -- app must work without paying

Action plan:
- [ ] Read rejection message in Resolution Center
- [ ] Fix the specific issue (usually a 1-2 hour fix)
- [ ] Resubmit immediately
- [ ] Second review is typically faster (24 hours)

### During Wait -- Launch Prep:

- [ ] Test that `admin@ordco.net` receives email (send yourself a test)
- [ ] Bookmark these monitoring pages:
  - App Store Connect Analytics
  - App Store Connect Ratings & Reviews
  - RevenueCat Dashboard
  - Supabase Dashboard (edge function logs)
- [ ] Prepare response templates (already in review-responses.md)
- [ ] Set daily reminder to check reviews for first 2 weeks

---

## Phase 7: Launch Week (March 2-8, 2026)

### Monday, March 2 -- LAUNCH DAY (estimated)

**Morning:**
- [ ] Release the app (if using "Manually Release")
- [ ] Verify app appears in App Store search
- [ ] Download from App Store on a real device (not TestFlight)
- [ ] Complete a full user flow to verify everything works in production
- [ ] Test a real subscription purchase (refund within 14 days if needed)

**Midday:**
- [ ] Share App Store link:
  - Personal social media
  - Relevant subreddits
  - Friends and family (ask for honest reviews)
  - Any other channels
- [ ] Update promotional text if desired

**Evening:**
- [ ] Check first day downloads in App Store Connect
- [ ] Check for any crash reports
- [ ] Check Supabase edge function logs (any errors?)
- [ ] Respond to any reviews that came in

### Tuesday, March 3

- [ ] Morning review check: any new reviews? Respond immediately.
- [ ] Monitor crash-free rate
- [ ] Monitor conversion rate (impressions > page views > installs)
- [ ] Note what keywords are driving impressions
- [ ] Continue sharing on social media

### Wednesday-Friday, March 4-6

- [ ] Daily review responses
- [ ] Daily crash and error monitoring
- [ ] Collect user feedback patterns:
  - What do people love?
  - What confuses people?
  - What bugs are reported?
  - What features are requested?
- [ ] Begin planning version 1.1:
  - Critical bug fixes
  - Top user request (if quick to implement)
  - Any metadata adjustments based on early data

### Saturday-Sunday, March 7-8

- [ ] Week 1 review:
  - Total downloads
  - Conversion rate
  - Average rating
  - Revenue (subscriptions)
  - Top issues
- [ ] Decide if version 1.1 hotfix is needed
- [ ] Adjust promotional text based on what is resonating
- [ ] Plan week 2 marketing push

---

## Key Milestones Summary

| Date | Milestone | Status |
|------|-----------|--------|
| Feb 13 | App Store Connect setup, metadata entered, legal done | Pending |
| Feb 14 | Subscriptions configured, RevenueCat verified | Pending |
| Feb 15 | First TestFlight build uploaded and tested | Pending |
| Feb 17 | Screenshots created | Pending |
| Feb 18 | All visual assets uploaded to App Store Connect | Pending |
| Feb 21 | Final build uploaded, all bugs fixed | Pending |
| Feb 24 | Pre-submission checklist complete | Pending |
| Feb 25 | **SUBMITTED TO APPLE** | Pending |
| Feb 27-Mar 2 | **APPROVED AND RELEASED** (estimated) | Pending |
| Mar 8 | First week complete, v1.1 planned | Pending |

---

## Contingency Plans

### Apple Review Takes Longer Than Expected
- **Buffer built in:** Submitting Feb 25 gives 5+ days before the 2-week mark (Feb 27)
- **If still in review by March 1:** Nothing to do but wait. Use the time for marketing prep.
- **If rejected:** Fix and resubmit same day. Second review is usually 24h.

### Critical Bug Found After Submission
- If found before approval: Contact Apple to reject the current submission, upload new build, resubmit
- If found after approval but before release: Upload new build, wait for new review
- If found after release: Submit v1.0.1 hotfix immediately, use "expedited review" if crash-level severity

### Low Downloads After Launch
- Normal for a new app with no marketing budget
- Focus on conversion rate, not volume
- Week 1-2: optimize screenshots and metadata based on data
- Week 3-4: expand marketing (ProductHunt, more Reddit, content marketing)

### Bad Reviews
- Respond to every single one (use templates from review-responses.md)
- Fix reported issues in v1.1
- Ask satisfied users to leave reviews (in-app prompt after positive moments)

---

## What to Skip if Behind Schedule

If you are running behind, here is what to cut (in order):

1. **App preview video** -- screenshots are sufficient for launch
2. **External TestFlight testing** -- your own testing is enough for v1
3. **Social media posts** -- you can do these after launch
4. **ProductHunt** -- better done 2-4 weeks post-launch with more reviews
5. **Screenshot 7 and 8** -- 6 screenshots is enough, focus on the best 6
6. **iPad screenshots** -- app.json confirms supportsTablet but phone screenshots are the priority

**Do NOT skip:**
- Subscription testing (Apple will reject if broken)
- Privacy policy (Apple will reject if missing)
- All metadata fields (Apple will reject if incomplete)
- At least 3 screenshots per required size
- "Restore Purchases" button verification
