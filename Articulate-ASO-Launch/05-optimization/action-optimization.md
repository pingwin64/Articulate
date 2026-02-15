# Optimization Action Items - Articulate

**Purpose:** Prioritized checklist of post-launch optimization actions.
**Last Updated:** February 13, 2026

---

## Priority 1: First 2 Weeks After Launch (March 2-15, 2026)

### Stability and Trust
- [ ] Achieve and maintain 99%+ crash-free rate
- [ ] Respond to every review within 24 hours
- [ ] Fix any critical bugs reported by users (ship v1.0.1 if needed)
- [ ] Verify all AI features work reliably in production (quizzes, pronunciation)
- [ ] Monitor Supabase edge function error rate (target: under 1%)
- [ ] Monitor OpenAI API usage and costs

### Baseline Metrics
- [ ] Record Week 1 metrics: impressions, page views, installs, conversion rate, rating
- [ ] Record Week 2 metrics and compare to Week 1
- [ ] Identify which search terms drive the most impressions
- [ ] Identify which search terms drive the most installs
- [ ] Calculate cost per acquisition if running any paid campaigns

### Early Signals
- [ ] Count total ratings after 2 weeks (target: 10+)
- [ ] Average rating target: 4.5 or higher
- [ ] Identify top 3 user complaints from reviews
- [ ] Identify top 3 user praises from reviews
- [ ] Identify top 3 feature requests from reviews

---

## Priority 2: Weeks 3-4 (March 16-29, 2026)

### Keyword Optimization (First Pass)
- [ ] Review App Store Connect search term data (Analytics > Sources)
- [ ] Identify keywords driving traffic that are NOT in your keyword field
- [ ] Identify keywords in your field that are driving ZERO traffic
- [ ] Draft updated keyword string for next version submission
- [ ] Consider adding/removing keywords based on actual data:
  - Keep: keywords with impressions + installs
  - Test: keywords with impressions but low installs (conversion issue?)
  - Drop: keywords with zero impressions after 4 weeks
  - Add: emerging keywords from search term data

### Version 1.1 Planning
- [ ] List all bugs reported in first 2 weeks
- [ ] List top 3 feature requests
- [ ] Prioritize: critical bugs > top request > nice-to-have improvements
- [ ] Update "What's New" text for v1.1
- [ ] Update keywords if changing (include in v1.1 submission)
- [ ] Update description if new features warrant it
- [ ] Submit v1.1 to App Store

### Promotional Text Rotation
- [ ] Review current promotional text performance (hard to measure directly, but check if conversion changed)
- [ ] Write a new promotional text variant
- [ ] Update in App Store Connect (no review needed)
- [ ] Rotate monthly to keep the listing fresh

---

## Priority 3: Month 2 (April 2026)

### Screenshot Optimization
- [ ] Review which screenshots users see in search results (first 3)
- [ ] Plan first A/B test using Apple Product Page Optimization (PPO):
  - Set up PPO test in App Store Connect
  - Control: current screenshots
  - Variant: new first screenshot or reordered screenshots
  - Run for 4 weeks minimum
- [ ] If not enough traffic for PPO: make best-judgment screenshot updates

### Review Acquisition
- [ ] Implement in-app review prompt (StoreReview API) if not already done
- [ ] Trigger after positive moments: completing a text, hitting a streak milestone, unlocking achievement
- [ ] Track how many prompts are shown vs how many reviews come in
- [ ] Target: 20-50 total ratings by end of month 2

### Content Expansion
- [ ] Add 5+ new curated texts to the library
- [ ] Choose genres based on user demand (check reviews and feature requests)
- [ ] Highlight new content in promotional text and What's New

### Localization (Low-Effort, High-Return)
- [ ] Localize metadata for UK English (different keyword variants)
- [ ] Localize metadata for Australian English
- [ ] Localize metadata for Canadian English
- [ ] Same screenshots can be reused -- just different title/subtitle/keywords
- [ ] This captures searches with regional spelling variations at zero development cost

---

## Priority 4: Month 3 (May 2026)

### Title/Subtitle Testing
- [ ] Evaluate whether current title is performing:
  - Are you ranking for "one word reader" or "speed reader" searches?
  - Which title variant would capture more traffic?
- [ ] Plan title test with v1.2 or v1.3:
  - Current: `Articulate: One Word Reader`
  - Test: `Articulate - Speed Reader` (if "speed reading" keywords dominate)
  - Test: `Articulate: Focus Reader` (if focus/productivity angle resonates)
- [ ] Run for 4 weeks, compare keyword rankings and conversion

### Icon Testing (PPO)
- [ ] Design 1-2 icon variants
- [ ] Set up PPO icon test
- [ ] Run for 4 weeks
- [ ] Implement winner

### Competitive Response
- [ ] Full competitor audit:
  - Have any competitors updated significantly?
  - New entrants in the space?
  - Any competitors copying Articulate's positioning?
- [ ] Adjust strategy if competitive landscape has shifted

---

## Priority 5: Months 4-6 (June-August 2026)

### Summer Reading Campaign
- [ ] Update promotional text for summer: "Your summer reading companion"
- [ ] Add summer-themed content to library
- [ ] Consider seasonal screenshots
- [ ] Push marketing on social media (summer reading lists, productivity)

### Retention Optimization
- [ ] Analyze which features retained users engage with most
- [ ] Analyze where free users drop off (what triggers premium conversion?)
- [ ] Optimize paywall messaging based on conversion data from RevenueCat
- [ ] A/B test paywall variants if possible

### App Store Featuring
- [ ] Check Apple's self-nomination form (available in App Store Connect)
- [ ] Submit app for editorial consideration if:
  - Rating is 4.5+ with 50+ ratings
  - App has a unique angle (RSVP + learning + accessibility)
  - App supports latest iOS features
  - Dyslexia Awareness Month (October) is a strong angle for featuring

---

## Priority 6: Months 7-12 (September 2026 - February 2027)

### Back to School (September)
- [ ] Major ASO refresh:
  - Keywords: add "study app", "reading practice", "back to school"
  - Promotional text: back-to-school angle
  - New content: study-relevant texts
  - Social media push targeting students

### Dyslexia Awareness Month (October)
- [ ] Major marketing push:
  - Highlight OpenDyslexic font in screenshots
  - Update promotional text: accessibility angle
  - Reach out to dyslexia organizations and communities
  - This is Articulate's strongest unique differentiator
  - Consider Apple editorial self-nomination around this

### Annual ASO Audit (December/January)
- [ ] Full keyword research from scratch
- [ ] Complete competitor landscape analysis
- [ ] Review all metrics: year-over-year trends
- [ ] Full screenshot redesign based on data
- [ ] New app preview video (if not done yet)
- [ ] Set goals for Year 2

---

## Ongoing Maintenance (Indefinite)

### Every Version Update
- [ ] Review and update "What's New" text
- [ ] Consider keyword adjustments
- [ ] Consider description updates if features changed
- [ ] Update screenshots if UI changed significantly
- [ ] Check that all URLs still work (privacy policy, support)

### Monthly
- [ ] Respond to all reviews
- [ ] Update promotional text (rotate angles)
- [ ] Check metrics against previous month
- [ ] One small optimization action (even just rewriting a screenshot caption)

### Quarterly
- [ ] Full keyword refresh
- [ ] Competitor audit
- [ ] Visual asset review
- [ ] Strategic positioning check

---

## Metrics Targets (First 6 Months)

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Total Downloads | 100-500 | 500-2,000 | 2,000-5,000 |
| Average Rating | 4.0+ | 4.3+ | 4.5+ |
| Total Ratings | 5-15 | 20-50 | 50-100 |
| Conversion Rate | 3-5% | 5-8% | 7-12% |
| MRR | $10-50 | $50-200 | $200-500 |
| Crash-Free Rate | 99%+ | 99.5%+ | 99.5%+ |

These are estimates for a solo-developed Education app with no paid marketing. Actual numbers will depend heavily on keyword competition and marketing efforts.

---

## Decision Framework: What to Optimize Next

When deciding what to work on, follow this priority:

1. **Fix crashes and bugs** -- nothing else matters if the app does not work
2. **Respond to reviews** -- social proof affects conversion more than anything
3. **Optimize conversion rate** -- screenshots and first impression matter most
4. **Improve keyword rankings** -- drives more impressions to convert
5. **Expand content** -- gives users more reasons to stay and subscribe
6. **Marketing and promotion** -- amplifies everything above

Do not skip to step 6 without nailing steps 1-5 first.
