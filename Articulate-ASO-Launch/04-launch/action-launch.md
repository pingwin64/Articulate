# Launch Action Plan - Articulate

**Purpose:** Single-page summary of the launch strategy with the most critical actions.
**Launch Target:** Submit February 25, 2026. Live by ~March 2, 2026.
**Last Updated:** February 13, 2026

---

## The 13-Day Plan (February 13 - 25)

### Days 1-3: Foundation (Feb 13-15)
**Goal: All administrative, legal, and metadata work done.**

Must complete:
- [ ] App Store Connect account ready, app created
- [ ] Banking and tax information submitted (can take 24-48h to verify)
- [ ] All metadata entered (title, subtitle, keywords, description, promotional text)
- [ ] Privacy policy live and accessible
- [ ] App Privacy nutrition labels completed
- [ ] Age rating completed (expect 4+)
- [ ] Content rights declaration completed
- [ ] Subscription products created in App Store Connect (monthly + lifetime)
- [ ] RevenueCat product IDs verified to match App Store Connect
- [ ] Sandbox subscription purchase tested
- [ ] First TestFlight build uploaded

### Days 4-6: Visual Assets (Feb 16-18)
**Goal: Screenshots and icon finalized and uploaded.**

Must complete:
- [ ] App icon verified (1024x1024, PNG, no transparency)
- [ ] 6-8 screenshots created for 6.9" display (1320x2868)
- [ ] 6-8 screenshots created for 6.7" display (1290x2796)
- [ ] All screenshots uploaded to App Store Connect
- [ ] Listing previewed in App Store Connect -- looks professional

### Days 7-9: Testing (Feb 19-21)
**Goal: App is stable and all flows work correctly.**

Must complete:
- [ ] Full QA pass: onboarding, reading, quiz, word bank, flashcards, pronunciation
- [ ] Subscription flow tested end-to-end (purchase, restore, unlock features)
- [ ] Free tier limits verified (1 text/day, 1 quiz/day, 2 definitions/day)
- [ ] Edge cases tested (offline, background/foreground, interruptions)
- [ ] All critical bugs fixed
- [ ] Final production build uploaded to App Store Connect

### Days 10-12: Polish and Prep (Feb 22-24)
**Goal: Ready to press "Submit for Review."**

Must complete:
- [ ] App Review Information filled in (contact info, reviewer notes, demo instructions)
- [ ] Rejection-proofing: all URLs work, Restore Purchases works, no placeholder content
- [ ] All permission strings are descriptive and accurate
- [ ] Pre-submission validation in App Store Connect (it flags missing items)
- [ ] Release option set to "Manually release this version"

### Day 13: Submit (Feb 25)
**Goal: App submitted to Apple.**

- [ ] Final review of entire App Store Connect listing
- [ ] Click "Submit for Review"
- [ ] Status: "Waiting for Review"
- [ ] Begin preparing launch announcements while waiting

---

## Critical Path (If You Do Nothing Else, Do These)

These 10 items are the absolute minimum to get the app on the App Store:

1. [ ] Create app in App Store Connect with correct bundle ID
2. [ ] Enter title, subtitle, keywords, description
3. [ ] Upload app icon (1024x1024)
4. [ ] Upload at least 3 screenshots per required size (6.9" and 6.7")
5. [ ] Set privacy policy URL
6. [ ] Complete App Privacy section
7. [ ] Complete age rating questionnaire
8. [ ] Set up subscription products (matching RevenueCat)
9. [ ] Upload production build and select it
10. [ ] Fill in App Review Information and submit

Everything else (marketing, video, localization, external testing) makes the launch better but is not required for submission.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Apple review takes 5+ days | Low | High | Submit Feb 25 (5-day buffer before 2-week mark) |
| App rejected for subscription issues | Medium | Medium | Test Restore Purchases thoroughly, show terms before purchase |
| App rejected for missing privacy details | Medium | Medium | Complete App Privacy section carefully, verify privacy policy URL |
| Critical bug found during testing | Medium | High | Days 7-9 dedicated to testing with Days 10-12 as buffer |
| Banking/tax verification delayed | Low | High | Start on Day 1 (Feb 13) to give maximum processing time |
| Screenshots take longer than expected | Medium | Low | Use a template tool (Figma, shotbot.io) to speed up creation |
| Supabase edge function fails in production | Low | High | Verify deployment before submission, test quiz + pronunciation |

---

## Post-Approval Checklist

When Apple approves (expected Feb 27 - March 2):

- [ ] Preview listing on App Store -- verify everything looks correct
- [ ] Click "Release This Version" when ready
- [ ] Download from App Store on a real device (not TestFlight)
- [ ] Complete a full user flow on the production build
- [ ] Share App Store link on social channels
- [ ] Ask friends/family to download and leave honest reviews
- [ ] Begin daily review monitoring (see ongoing-tasks.md)

---

## Files Reference

| File | Purpose | Location |
|------|---------|----------|
| Pre-Launch Checklist | Full 89-item validation checklist | `04-launch/prelaunch-checklist.md` |
| Timeline | Day-by-day schedule with specific dates | `04-launch/timeline.md` |
| Submission Guide | Step-by-step App Store Connect walkthrough | `04-launch/submission-guide.md` |
| Review Responses | Templates for every review scenario | `05-optimization/review-responses.md` |
| Ongoing Tasks | Daily/weekly/monthly optimization schedule | `05-optimization/ongoing-tasks.md` |
| Optimization Actions | Prioritized action items for months 1-12 | `05-optimization/action-optimization.md` |
| Apple Metadata | Finalized title, subtitle, keywords, description | `../Articulate/02-metadata/apple-metadata.md` |
| Visual Assets Spec | Screenshot and icon specifications | `../Articulate/02-metadata/visual-assets-spec.md` |

---

## Today's Action Items (February 13, 2026)

Start with these right now:

1. Log into App Store Connect
2. Create the app (name, bundle ID, SKU)
3. Go to Agreements, Tax, and Banking -- complete everything (this can block you later)
4. Enter all metadata (title, subtitle, keywords, description)
5. Set privacy policy URL
6. Complete App Privacy and Age Rating sections
7. Upload a build to TestFlight

If you finish all seven today, you are ahead of schedule.
