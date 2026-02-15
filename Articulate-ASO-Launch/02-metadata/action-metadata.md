# Articulate - Metadata Implementation Checklist

**Purpose:** Step-by-step guide to implementing App Store metadata
**Last Updated:** February 13, 2026

---

## Pre-Submission Requirements

Before opening App Store Connect, ensure you have:

- [ ] **Apple Developer Account** (enrolled in Apple Developer Program, $99/year)
- [ ] **App Bundle ID** created in Developer Portal (e.g., `com.ordco.articulate`)
- [ ] **App icon** ready (1024×1024px PNG, no transparency)
- [ ] **Screenshots** ready (6.7" and 6.9" sizes, 6-10 per size)
- [ ] **Privacy Policy URL** live and accessible (https://ordco.net/articulate/privacy)
- [ ] **Terms of Service URL** live and accessible (https://ordco.net/articulate/terms)
- [ ] **Support email** monitored (admin@ordco.net)
- [ ] **App binary** ready to upload (from Xcode or Transporter)

---

## Phase 1: App Store Connect Initial Setup

### Step 1.1: Create New App
1. Log in to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** `Articulate - Read & Learn` (this can be changed later)
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** Select your registered bundle ID
   - **SKU:** Unique identifier (e.g., `articulate-ios-001`)
   - **User Access:** Full Access
4. Click **Create**

### Step 1.2: Set App Information
Navigate to **App Information** (left sidebar):

1. **Localizable Information** section:
   - **Name:** `Articulate - Read & Learn` (24/30 characters)
   - **Subtitle:** `Focus Reading & Vocab Builder` (30/30 characters)
   - **Privacy Policy URL:** `https://ordco.net/articulate/privacy`

2. **Category** section:
   - **Primary Category:** Education
   - **Secondary Category:** Reference

3. **Age Rating:**
   - Click **Edit**
   - Answer questionnaire (all "No" for Articulate)
   - Rating will be: **4+**

4. **Content Rights:**
   - Select: **Does not contain third-party content** (or "Does contain" if you have licensed texts)

5. Click **Save** at top right

---

## Phase 2: Version Information & Metadata

Navigate to your app → **App Store** tab → Select version (e.g., **1.0 Prepare for Submission**):

### Step 2.1: Upload App Icon & Screenshots

**App Icon:**
1. Scroll to **App Icon** section
2. Drag and drop your 1024×1024px PNG icon
3. Wait for validation (no errors should appear)

**iPhone Screenshots:**
1. Scroll to **6.7" Display** section
2. Click **+** or drag screenshots
3. Upload 6-10 screenshots (1290×2796px)
4. Drag to reorder (first screenshot is most important)

5. Scroll to **6.9" Display** section (if present)
6. Upload 6-10 screenshots (1320×2868px)
7. Reorder to match 6.7" sequence

**App Preview Video (Optional):**
1. Click **+** under App Previews
2. Upload video (H.264, 15-30s, matching screenshot dimensions)
3. Select poster frame (thumbnail shown before playing)

### Step 2.2: Add Metadata Text

**Promotional Text** (170/170 characters):
```
🎯 New: AI pronunciation scoring! Record yourself saying any word and get instant feedback. Perfect your accent while building vocabulary. Try it free today!
```

**Description** (3,847/4,000 characters):

Copy the full description from `apple-metadata.md` → Description section (lines 23-103).

Paste into the **Description** field in App Store Connect.

**Keywords** (100/100 characters):
```
speed,reading,vocabulary,fluency,dyslexia,esl,focus,comprehension,study,learn,words,rsvp,education
```
⚠️ **CRITICAL:** No spaces after commas. Copy exactly as shown.

**Support URL:**
```
https://ordco.net/articulate/terms
```

**Marketing URL (optional):**
Leave blank unless you have a dedicated marketing website.

**What's New** (547/4,000 characters):

Copy the "What's New" section from `apple-metadata.md` (lines 107-126).

This describes v1.0 features for launch.

### Step 2.3: Copyright & Contact
1. **Copyright:** `2026 ORDCO` (or your company name)
2. **Contact Information:**
   - Name: Your name
   - Phone: Your contact number
   - Email: `admin@ordco.net`

---

## Phase 3: App Review Information

Scroll to **App Review Information** section:

1. **Sign-in required:** No (assuming app works without account)
   - If you have premium features requiring sign-in, select Yes and provide test account credentials

2. **Contact Information:**
   - First Name: [Your first name]
   - Last Name: [Your last name]
   - Phone Number: [Your phone]
   - Email: `admin@ordco.net`

3. **Notes (optional):**
   ```
   Articulate is a reading and vocabulary learning app. Core features work without internet connection. Premium features require in-app purchase via RevenueCat.

   To test premium features, tap the "Profile" icon → "Get Pro" → select a plan. Use Apple's Sandbox testing for subscriptions.

   Key features to test:
   - RSVP reading (one word at a time)
   - Custom text upload (paste or camera scan)
   - Comprehension quiz after completing a text
   - Word bank with flashcard review
   - Pronunciation practice with AI scoring

   Thank you!
   ```

4. **Attachment (optional):** Upload demo video or screenshots if needed for review context

---

## Phase 4: Pricing & Availability

Navigate to **Pricing and Availability** (left sidebar):

### Step 4.1: Set Pricing
1. **Price:** Free (with in-app purchases)
2. Click **Manage Pricing** if you need to adjust future pricing

### Step 4.2: Availability
1. **Availability:** All territories (or select specific countries)
2. **Release Date:**
   - Select: **Automatically release this version**
   - OR: **Manually release this version** (if you want to control launch timing)

### Step 4.3: App Store Distribution
1. **Make this app available in the following stores:**
   - Check: **App Store**
   - Uncheck: **App Store for iPhone and iPad** (if iPhone-only)

---

## Phase 5: In-App Purchases (RevenueCat)

If you haven't already configured subscriptions:

### Step 5.1: Create Subscription Groups
1. Navigate to **Features** → **In-App Purchases**
2. Click **+** → **Subscriptions**
3. Create subscription group: `Premium Access`
4. Reference Name: `Premium Access`

### Step 5.2: Add Subscription Products
Create three subscriptions:

**1. Weekly Subscription:**
- Product ID: `com.ordco.articulate.premium.weekly`
- Reference Name: `Articulate Premium Weekly`
- Duration: 1 Week
- Price: (Select tier, e.g., $4.99)
- Localized Description: `Unlock all features for one week`

**2. Monthly Subscription:**
- Product ID: `com.ordco.articulate.premium.monthly`
- Reference Name: `Articulate Premium Monthly`
- Duration: 1 Month
- Price: (Select tier, e.g., $9.99)
- Localized Description: `Unlock all features for one month`

**3. Lifetime Purchase:**
- Product ID: `com.ordco.articulate.premium.lifetime`
- Reference Name: `Articulate Premium Lifetime`
- Type: **Non-Consumable** (NOT subscription)
- Price: (Select tier, e.g., $49.99)
- Localized Description: `Unlock all features forever`

### Step 5.3: Configure in RevenueCat
1. Log in to RevenueCat dashboard
2. Add product IDs created above
3. Create entitlements (e.g., `premium`)
4. Test with Sandbox Apple IDs

---

## Phase 6: Upload App Binary

### Option A: Upload from Xcode
1. Open Xcode workspace
2. Select **Product** → **Archive**
3. Once archive completes, click **Distribute App**
4. Select **App Store Connect**
5. Follow prompts to upload

### Option B: Upload with Transporter
1. Export .ipa from Xcode
2. Open **Transporter** app (Mac App Store)
3. Drag .ipa into Transporter
4. Click **Deliver**

### Step 6.1: Wait for Processing
- Binary processing takes 10-60 minutes
- You'll receive email when ready
- Refresh App Store Connect to see build appear

### Step 6.2: Select Build
1. Return to version page in App Store Connect
2. Scroll to **Build** section
3. Click **Select a build before you submit your app**
4. Choose your uploaded build
5. Answer export compliance questions:
   - Does your app use encryption? **No** (unless you added custom encryption)

---

## Phase 7: Final Review & Submit

### Step 7.1: Validate All Fields
Go through each section and ensure:
- [ ] App icon uploaded and validated
- [ ] Screenshots uploaded (6-10 per size)
- [ ] Description, keywords, promotional text all filled
- [ ] Privacy Policy URL works and is accessible
- [ ] Support URL works
- [ ] Age rating completed
- [ ] Categories selected
- [ ] Pricing set to Free
- [ ] In-app purchases created and submitted (if using)
- [ ] Build selected
- [ ] App Review Information complete

### Step 7.2: Submit for Review
1. Scroll to top of version page
2. Click **Add for Review** (if using in-app purchases)
3. Click **Submit for Review**
4. Confirm submission

### Step 7.3: Expected Timeline
- **Processing:** 10-60 minutes (binary upload)
- **Waiting for Review:** 1-3 days
- **In Review:** 12-48 hours
- **Total:** 2-5 days typically

You'll receive email updates at each stage.

---

## Phase 8: Post-Submission Monitoring

### Step 8.1: Check App Review Status
- Log in to App Store Connect daily
- Check **My Apps** → **Articulate** → status badge
- Respond promptly to any rejection reasons

### Step 8.2: Common Rejection Reasons & Fixes
| Rejection Reason | Fix |
|------------------|-----|
| Privacy Policy inaccessible | Verify URL works without login |
| Incomplete metadata | Check all required fields filled |
| In-app purchase issues | Test subscription flow in Sandbox |
| Crash on launch | Test on physical device, submit hotfix |
| Misleading screenshots | Ensure screenshots match actual features |
| Missing export compliance | Answer encryption questions correctly |

### Step 8.3: If Approved
1. App status changes to **Ready for Sale**
2. If "Manually release" selected, click **Release this version**
3. App goes live within 2-4 hours
4. Search App Store for "Articulate" to verify

---

## Phase 9: Post-Launch Optimization

### Week 1 Tasks:
- [ ] Monitor App Store Connect Analytics (impressions, conversion rate)
- [ ] Read all user reviews and respond
- [ ] Track keyword rankings (use Sensor Tower or AppFollow)
- [ ] Update promotional text if needed (no review required)

### Week 2-4 Tasks:
- [ ] Set up Product Page Optimization (A/B test screenshots or subtitle)
- [ ] Analyze which search terms drive traffic
- [ ] Adjust keywords for next version if needed

### Monthly Tasks:
- [ ] Update promotional text with new features or seasonal messaging
- [ ] Monitor competitor listings for emerging keywords
- [ ] Add user testimonials to description if strong reviews received

---

## Phase 10: Metadata Updates (Future Versions)

### Fields You Can Change Without Review:
- **Promotional Text** (live in 2 hours)
- **Screenshots** (after initial approval, live in 2 hours)
- **App Preview videos** (after initial approval)
- **Pricing**

### Fields Requiring New Version Submission:
- **App Name**
- **Subtitle**
- **Keywords**
- **Description**
- **What's New**
- **Categories**

### How to Update Metadata:
1. Create new version in App Store Connect (e.g., 1.1)
2. Upload new binary (if app code changed)
3. Update metadata fields
4. Submit for review (1-2 days typically)

---

## Troubleshooting

### Issue: Keywords Not Saving
- **Cause:** Spaces after commas
- **Fix:** Remove all spaces: `word1,word2,word3`

### Issue: Icon Rejected
- **Cause:** Transparency or rounded corners
- **Fix:** Export as PNG with no alpha channel, no rounded corners

### Issue: Screenshots Wrong Size
- **Cause:** Approximate dimensions (e.g., 1290.5 × 2796)
- **Fix:** Export at exact pixel dimensions, no decimals

### Issue: Privacy Policy 404
- **Cause:** URL not live yet
- **Fix:** Deploy privacy policy before submission, test URL in incognito

### Issue: Build Not Appearing
- **Cause:** Processing still in progress
- **Fix:** Wait 30-60 minutes, refresh page

### Issue: Subscription Products Not Showing in App
- **Cause:** Not configured in RevenueCat or wrong product IDs
- **Fix:** Verify product IDs match exactly in RevenueCat dashboard

---

## Resources

**Apple Documentation:**
- App Store Connect Help: https://help.apple.com/app-store-connect/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Screenshot Specifications: https://help.apple.com/app-store-connect/#/devd274dd925

**Metadata Files:**
- Apple Metadata: `/outputs/articulate/02-metadata/apple-metadata.md`
- Visual Assets Spec: `/outputs/articulate/02-metadata/visual-assets-spec.md`
- This Checklist: `/outputs/articulate/02-metadata/action-metadata.md`

**Analytics Tools:**
- App Store Connect Analytics (free, built-in)
- Sensor Tower: https://sensortower.com
- AppFollow: https://appfollow.io
- App Radar: https://appradar.com

**Support:**
- Email: admin@ordco.net
- App Store Connect Support: https://developer.apple.com/contact/

---

## Quick Reference: Character Limits

| Field | Limit | Used | Status |
|-------|-------|------|--------|
| App Name | 30 | 24 | ✅ |
| Subtitle | 30 | 30 | ✅ |
| Promotional Text | 170 | 170 | ✅ |
| Keywords | 100 | 100 | ✅ |
| Description | 4,000 | 3,847 | ✅ |
| What's New | 4,000 | 547 | ✅ |

---

## Checklist Summary

**Pre-Submission:**
- [ ] Apple Developer account enrolled ($99/year)
- [ ] Bundle ID created
- [ ] App icon ready (1024×1024px PNG)
- [ ] Screenshots ready (6-10 per size)
- [ ] Privacy Policy live at URL
- [ ] Terms of Service live at URL
- [ ] Support email monitored

**App Store Connect Setup:**
- [ ] New app created with bundle ID
- [ ] App Information filled (name, subtitle, categories)
- [ ] Age rating completed (4+)
- [ ] Icon uploaded
- [ ] Screenshots uploaded (6.7" and 6.9")
- [ ] Description pasted (3,847 characters)
- [ ] Keywords pasted (100 characters, no spaces)
- [ ] Promotional text pasted (170 characters)
- [ ] Support and Privacy URLs added
- [ ] What's New text added

**In-App Purchases:**
- [ ] Subscription group created
- [ ] Weekly subscription created
- [ ] Monthly subscription created
- [ ] Lifetime purchase created
- [ ] Products configured in RevenueCat

**Upload & Submit:**
- [ ] Binary uploaded from Xcode or Transporter
- [ ] Build selected in App Store Connect
- [ ] Export compliance answered
- [ ] App Review Information complete
- [ ] All fields validated
- [ ] Submitted for review

**Post-Submission:**
- [ ] Monitor status daily
- [ ] Respond to rejection reasons if any
- [ ] Release app when approved
- [ ] Track analytics and reviews
- [ ] Update promotional text monthly

---

**Estimated Time to Complete:** 2-3 hours (excluding binary upload processing)

**Next Steps:** Start with Phase 1 (App Store Connect Initial Setup) and work through each phase sequentially.

**Questions?** Email admin@ordco.net
