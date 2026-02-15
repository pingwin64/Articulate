# App Store Submission Guide - Articulate

**Step-by-step walkthrough for submitting Articulate to the Apple App Store.**
**Last Updated:** February 13, 2026

---

## Prerequisites

Before starting, confirm you have:

1. An active Apple Developer Program membership ($99/year) at developer.apple.com
2. Access to App Store Connect at appstoreconnect.apple.com
3. Xcode installed (for uploading builds) or EAS CLI configured
4. All metadata finalized (see `apple-metadata.md`)
5. All screenshots created (see `visual-assets-spec.md`)
6. Privacy policy published at a public URL
7. RevenueCat configured with correct product IDs

---

## Step 1: Create the App in App Store Connect

1. Go to **appstoreconnect.apple.com** > **My Apps**
2. Click the **+** button (top left) > **New App**
3. Fill in:
   - **Platforms:** iOS
   - **Name:** `Articulate: One Word Reader`
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** Select `com.articulate.app` from the dropdown
     - If not in the dropdown: go to developer.apple.com > Certificates, Identifiers & Profiles > Identifiers > register it first
   - **SKU:** `articulate-ios-v1` (internal identifier, users never see this)
   - **User Access:** Full Access (or Limited if you have team members)
4. Click **Create**

The app page will open with a draft version 1.0.

---

## Step 2: App Information (Left Sidebar)

Navigate to **App Information** in the left sidebar.

### General Information
- **Name:** `Articulate: One Word Reader` (this is your App Store title)
- **Subtitle:** `Read Faster, Learn New Words`
- **Category:**
  - Primary: Education
  - Secondary: Books

### Content Rights
- Select: "This app does not contain, show, or access third-party content"
  - OR if curated texts are third-party: "This app contains third-party content" > "I have the necessary rights"
- If Apple asks about specific texts: have documentation ready showing public domain status

### Age Rating
- Click "Set up" or "Edit" next to Age Rating
- Answer the questionnaire:
  - Cartoon or Fantasy Violence: **None**
  - Realistic Violence: **None**
  - Sexual Content or Nudity: **None**
  - Profanity or Crude Humor: **None**
  - Alcohol, Tobacco, or Drug References: **None**
  - Simulated Gambling: **None**
  - Horror/Fear Themes: **None**
  - Medical/Treatment Information: **None**
  - Contests: **None**
  - Unrestricted Web Access: **No** (app does not have a web browser)
  - Gambling with Real Currency: **No**
- Result should be: **4+**

---

## Step 3: Pricing and Availability (Left Sidebar)

Navigate to **Pricing and Availability**.

### Price
- **Price Schedule:** Free
  - Click "Add Pricing" if not set
  - Base country: United States
  - Price: Free (Tier 0)
  - This is correct because revenue comes from in-app subscriptions, not upfront purchase

### Availability
- **Available in all territories** (recommended for maximum reach)
- Or select specific territories if you have a reason to restrict

### Pre-Orders (Optional)
- Skip for now unless you want to build anticipation before the app is approved

---

## Step 4: App Privacy (Left Sidebar)

Navigate to **App Privacy**.

This generates the "App Privacy" nutrition label users see on your App Store listing.

### Privacy Policy URL
- Enter: `https://articulate-ashy.vercel.app/privacy.html`

### Data Collection Questionnaire

Click "Get Started" or "Edit" and answer:

**Do you or your third-party partners collect data from this app?** Yes

**Data Types to Declare:**

1. **Purchases**
   - Collected: Yes (RevenueCat tracks subscription status)
   - Linked to identity: No (RevenueCat uses anonymous IDs)
   - Used for tracking: No
   - Purpose: App Functionality

2. **Audio Data** (if pronunciation feature sends audio to server)
   - Collected: Yes (microphone recordings sent to OpenAI via Supabase for transcription)
   - Linked to identity: No
   - Used for tracking: No
   - Purpose: App Functionality
   - Note: Audio is processed and immediately discarded, not stored

3. **Diagnostics** (if using Apple's default crash reporting)
   - Collected: Yes
   - Linked to identity: No
   - Used for tracking: No
   - Purpose: App Functionality

**Data NOT collected (select "No" for these):**
- Contact Info
- Health & Fitness
- Financial Info
- Location
- Contacts
- User Content (the texts users paste stay on-device)
- Browsing History
- Search History
- Identifiers
- Usage Data (stays on-device via MMKV)
- Sensitive Data

---

## Step 5: Subscriptions (Left Sidebar)

Navigate to **Subscriptions** (under "Features" or as its own section).

### Create Subscription Group
1. Click **+** next to Subscription Groups
2. Group Reference Name: `Articulate Premium`
3. Click Create

### Add Monthly Subscription
1. Inside the group, click **+** next to Subscriptions
2. Reference Name: `Monthly` (internal name)
3. Product ID: Must match RevenueCat exactly (e.g., `articulate_monthly` or whatever you configured)
4. Click Create
5. Configure:
   - **Subscription Duration:** 1 Month
   - **Subscription Prices:** Click "Add Pricing"
     - Base territory: United States
     - Select price tier (e.g., $4.99/month, $6.99/month -- your choice)
     - Apple will auto-generate prices for other territories
     - Review auto-generated prices, adjust if needed
   - **Localization:** Click "+" next to Localizations
     - Language: English (U.S.)
     - Subscription Display Name: "Articulate Pro" (shown to users)
     - Description: "Unlimited access to all fonts, themes, quizzes, flashcards, pronunciation drills, custom text imports, and premium reading features. Cancel anytime."
6. Save

### Add Lifetime Purchase
1. Go back to the subscription group (or create a Non-Consumable In-App Purchase instead)
   - **Option A: Non-Consumable IAP** (recommended for "lifetime")
     - Go to **In-App Purchases** in left sidebar
     - Click **+** > **Non-Consumable**
     - Reference Name: `Lifetime`
     - Product ID: Must match RevenueCat (e.g., `articulate_lifetime`)
     - Price: Select tier (e.g., $29.99, $39.99, $49.99)
     - Localization: same as above
   - **Option B: Non-Renewing Subscription** (alternative)
     - Similar setup but in the subscription section

### Subscription Review Screenshot
- For each subscription product, Apple requires a screenshot showing what the subscription unlocks
- Take a screenshot of your paywall or premium features screen
- Upload in the subscription product's "Review Information" section

### Subscription Status URL (Optional)
- If you want Apple to notify your server of subscription events:
  - Enter your server endpoint URL
  - RevenueCat handles this automatically if configured
  - Skip if unsure

---

## Step 6: Version Information (Main Version Page)

Click on **iOS App** > **1.0 Prepare for Submission** (or the version number).

### Screenshots
1. Scroll to the **Screenshots** section
2. You will see device size tabs:
   - **iPhone 6.9" Display** -- upload 6.9" screenshots (1320x2868)
   - **iPhone 6.7" Display** -- upload 6.7" screenshots (1290x2796)
3. Drag and drop or click to upload screenshots
4. Arrange in order (first screenshot = most important, shown in search results)
5. Order should be:
   1. RSVP reading (hero shot)
   2. Speed control
   3. Curated library
   4. AI quiz
   5. Flashcards / word bank
   6. Custom text import
   7. Streaks and progress (if included)
   8. Accessibility / themes (if included)

### App Preview (Optional)
- Upload video in the same screenshots section
- Select the correct device size
- Apple will review the video content

### Promotional Text
```
New: Pronunciation practice with instant AI feedback! Read one word at a time, take comprehension quizzes, and build your vocabulary with flashcard review. Try it free.
```
- Paste into the Promotional Text field
- This can be updated anytime without a new app version or review

### Description
- Paste the full description from apple-metadata.md (3,033 characters)
- Double-check formatting: blank lines between sections will be preserved

### Keywords
```
rsvp,speed read,dyslexia,comprehension,vocabulary,flashcard,streak,pronunciation,focus,wpm,literacy
```
- Paste exactly as shown (commas, no spaces)
- 99/100 characters

### What's New
```
Welcome to Articulate! Read one word at a time, build your vocabulary, and track your reading progress.
```

### Support URL
```
https://articulate-ashy.vercel.app/privacy.html
```

### Marketing URL (Optional)
- Leave blank or enter landing page URL if you have one

---

## Step 7: Build Selection

### Upload the Build

**Option A: Via Xcode**
1. In Xcode, select your project > target > set version to 1.0.0, build to 1
2. Product > Archive
3. When archive completes, Organizer window opens
4. Click "Distribute App"
5. Select "App Store Connect"
6. Follow prompts (upload)
7. Wait 15-60 minutes for processing in App Store Connect

**Option B: Via EAS Build + Submit**
1. `eas build --platform ios --profile production`
2. Wait for build to complete
3. `eas submit --platform ios --latest`
4. Or download .ipa and upload via Transporter app

**Option C: Via Transporter (macOS app)**
1. Build the .ipa file
2. Open Transporter (free from Mac App Store)
3. Drag .ipa into Transporter
4. Click "Deliver"

### Select the Build in App Store Connect
1. After processing, the build appears under "Build" section on the version page
2. Click **+** next to Build (or click the build selector)
3. Select the processed build
4. If you see a "Missing Compliance" warning:
   - Click "Manage" next to the compliance warning
   - Answer: "Does your app use encryption?" > **No** (app uses only HTTPS which is exempt)
   - Or it may already be handled by `ITSAppUsesNonExemptEncryption: false` in app.json

---

## Step 8: App Review Information

Scroll down to **App Review Information** on the version page.

### Contact Information
- **First Name:** [Your first name]
- **Last Name:** [Your last name]
- **Phone Number:** [Your phone number]
- **Email:** admin@ordco.net

### Sign-In Information
- **Sign-in required:** No (Articulate does not require an account)
- Leave username and password blank

### Notes
Paste this:
```
Articulate displays one word at a time for focused reading practice.

HOW TO TEST:
1. Tap any category on the home screen to browse available texts
2. Select a text and tap Play to begin reading
3. Words appear one at a time -- tap or wait for the next word
4. After finishing, take the AI-generated comprehension quiz
5. Save unfamiliar words to your word bank
6. Review saved words with flashcards (Library > Words > Review)
7. Try pronunciation practice on saved words

PERMISSIONS:
- Microphone: Used for pronunciation practice. Audio is sent to our server
  for transcription via OpenAI Whisper and is NOT stored.
- Camera: Used for scanning text from photos/documents (OCR).
- Photo Library: Used for selecting images to scan text from.
- Notifications: Used for daily streak reminders (optional, user-initiated).

SUBSCRIPTIONS:
- Free tier includes: RSVP reading, curated library (3 categories),
  1 custom text/day, 1 quiz/day, 2 definition lookups/day.
- Premium unlocks: all categories, unlimited texts/quizzes/definitions,
  all fonts including OpenDyslexic, all themes, pronunciation drills,
  flashcard review, text-to-speech, and more.
- "Restore Purchases" is available in the paywall and in Settings.

DATA PRIVACY:
- No user account required. All reading data is stored locally on the
  device using MMKV storage.
- Audio recordings for pronunciation are processed by OpenAI and
  immediately discarded.
- RevenueCat handles subscription management with anonymous user IDs.
```

### Attachment (Optional)
- You can attach a screen recording showing the app in action
- Helpful if the app has a unique interaction pattern (RSVP is unusual)

---

## Step 9: Release Options

Still on the version page, scroll to **Version Release**.

Choose one:
- **Automatically release this version** -- app goes live as soon as Apple approves
- **Manually release this version** (RECOMMENDED) -- you control when it goes live after approval
- **Automatically release on a specific date** -- schedule for a specific date

**Recommendation:** Choose "Manually release this version" for your first launch. This gives you control to:
- Verify the listing looks correct
- Coordinate with any marketing
- Release at the optimal time (Tuesday-Thursday morning, U.S. time)

---

## Step 10: Submit for Review

1. Review all fields one final time
2. Click **Save** (top right)
3. Click **Submit for Review** (top right, blue button)
4. Apple may ask additional questions:
   - **Content Rights:** Confirm you have rights to all content
   - **Advertising Identifier (IDFA):** Select "No" (Articulate does not use IDFA)
   - **Export Compliance:** Confirm no non-exempt encryption (already declared in app.json)
5. Status changes to **"Waiting for Review"**

---

## Step 11: During the Review Period

### Timeline Expectations
- **Typical review time:** 24-48 hours
- **Best case:** Same day (6-12 hours)
- **Worst case:** 3-5 business days (rare for simple apps)
- **Status progression:** Waiting for Review > In Review > Pending Developer Release (if manual) or Ready for Sale

### What to Watch For
- **Email notifications** from Apple (check spam folder too)
- **App Store Connect status changes** (check the app's version page)
- **Resolution Center messages** (Apple may ask questions without rejecting)

### If You Get a Message in Resolution Center
- Apple may ask for clarification about permissions, data practices, or content
- Respond clearly and promptly
- This does NOT mean rejection -- they are just asking questions

---

## Step 12: Handling Rejection

If Apple rejects your app, here is what to do:

### Read the Rejection Carefully
- Go to **Resolution Center** in App Store Connect
- Read the specific guideline cited (e.g., "Guideline 3.1.1 - Business - Payments - In-App Purchase")
- Apple usually tells you exactly what to fix

### Most Common Rejections for Education/Reading Apps

**1. Guideline 3.1.1 - Subscription Issues**
- Missing "Restore Purchases" button
- Subscription terms not shown before purchase
- No way to manage/cancel subscription
- FIX: Ensure restore button is visible, subscription terms are displayed on paywall

**2. Guideline 2.1 - App Completeness**
- App crashes
- Placeholder content
- Broken features
- FIX: Test everything thoroughly before resubmitting

**3. Guideline 2.3.7 - Accurate Metadata**
- Screenshots do not match actual app
- Description mentions features that do not exist
- FIX: Update screenshots or description to match reality

**4. Guideline 5.1.1 - Data Collection and Storage**
- Privacy policy missing or inaccessible
- Data collection not properly declared
- FIX: Verify privacy policy URL works, update App Privacy section

**5. Guideline 5.1.2 - Data Use and Sharing**
- Not disclosing that audio is sent to a third party (OpenAI)
- FIX: Declare in privacy policy and App Privacy section

**6. Guideline 2.5.4 - Multitasking**
- App does not support expected iOS features
- FIX: Test on all supported device sizes

### Resubmission Process
1. Fix the cited issue
2. If code change needed: upload new build, select it in App Store Connect
3. If metadata change needed: update in App Store Connect
4. Reply in Resolution Center explaining what you fixed
5. Click "Submit for Review" again
6. Second review is typically faster (often 24 hours)

---

## Step 13: After Approval -- Releasing the App

If you selected "Manually release":

1. Status shows **"Pending Developer Release"**
2. Verify the listing one final time:
   - Go to your app's App Store page (or use the direct link)
   - Check title, subtitle, description, screenshots
3. When ready: click **"Release This Version"**
4. App appears on the App Store within minutes
5. Verify by searching "Articulate" in the App Store on your phone

### Optimal Release Timing
- **Best days:** Tuesday, Wednesday, or Thursday
- **Best time:** Morning U.S. Eastern (9-11 AM ET)
- **Avoid:** Friday afternoon (if issues arise, Apple support is slower on weekends)
- **Avoid:** Major Apple event days or iOS release days (your app gets lost in the noise)

---

## Post-Submission Checklist

- [ ] App Store Connect status is "Waiting for Review"
- [ ] Email notifications enabled for review status changes
- [ ] Resolution Center bookmarked for quick access
- [ ] New build ready to upload if rejection requires code fix
- [ ] Response templates ready (review-responses.md)
- [ ] Launch announcement drafted and ready to send
- [ ] Monitoring dashboards bookmarked (RevenueCat, Supabase, App Store Connect Analytics)

---

## Quick Reference: App Store Connect Fields

| Field | Value | Where |
|-------|-------|-------|
| App Name | Articulate: One Word Reader | App Information |
| Subtitle | Read Faster, Learn New Words | App Information |
| Bundle ID | com.articulate.app | App Information |
| SKU | articulate-ios-v1 | App Information |
| Primary Category | Education | App Information |
| Secondary Category | Books | App Information |
| Age Rating | 4+ | App Information |
| Price | Free | Pricing and Availability |
| Keywords | rsvp,speed read,dyslexia,... | Version Page |
| Description | Read one word at a time... | Version Page |
| Promotional Text | New: Pronunciation practice... | Version Page |
| What's New | Welcome to Articulate!... | Version Page |
| Support URL | https://articulate-ashy.vercel.app/privacy.html | Version Page |
| Privacy Policy URL | https://articulate-ashy.vercel.app/privacy.html | App Privacy |
| Contact Email | admin@ordco.net | App Review Information |
| Release Option | Manually release | Version Page |

---

## Gotchas and Tips

1. **Build processing can take up to an hour.** Upload your build before filling in other fields so it processes in the background.

2. **The "Name" field in App Information is your title.** This is what appears on the App Store. It is different from the "display name" users see on their home screen (that comes from app.json).

3. **Keywords are invisible to users** but indexed by Apple Search. Do not repeat words already in your title or subtitle -- Apple indexes those automatically.

4. **Promotional text does not affect search rankings** but is the first thing users read on your product page. Update it frequently.

5. **Screenshots in App Store search results** show only the first 3 (in portrait). Make them count.

6. **App Store Connect has a "Preview on App Store" feature.** Use it to see exactly how your listing will appear to users before submitting.

7. **If your build shows "Missing Compliance"** after upload, click it immediately and answer the encryption question. Builds stuck in "Missing Compliance" cannot be submitted.

8. **Sandbox testing environment** is separate from production. Your sandbox purchases will not appear as real charges. Use sandbox tester accounts created in App Store Connect.

9. **The review team works 7 days a week** but response times may be slightly slower on weekends and U.S. holidays.

10. **If your app is approved but you are not ready to launch**, that is fine. "Manually release" gives you unlimited time to release. Just be aware the listing is visible in some contexts even before release.
