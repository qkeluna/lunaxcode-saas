# Testing Pre-Selection in Production

**Production URL:** https://lunaxcode-saas.pages.dev
**Latest Deployment:** https://1c9ec444.lunaxcode-saas.pages.dev

---

## ⚠️ CRITICAL: Clear Browser Cache & SessionStorage

The pre-selection might not work if you're testing with cached data. Follow these steps:

### Option 1: Incognito/Private Window (RECOMMENDED)
1. Open a new **Incognito/Private browsing window**
2. Navigate to: https://lunaxcode-saas.pages.dev/onboarding?serviceId=1 (Landing Page)
3. Or: https://lunaxcode-saas.pages.dev/onboarding?serviceId=2 (Business Website)
4. Complete Step 1 and proceed to Step 2
5. Verify pre-selections

### Option 2: Clear Cache + SessionStorage
1. Open your production site: https://lunaxcode-saas.pages.dev
2. Open DevTools (F12)
3. **Clear Cache:**
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"
4. **Clear SessionStorage:**
   - Go to: Application tab → Session Storage
   - Delete all entries starting with `onboarding`
   - Or run in console:
   ```javascript
   sessionStorage.clear();
   location.reload();
   ```

### Option 3: Fresh Browser Session
1. Close ALL browser windows/tabs completely
2. Reopen browser
3. Navigate directly to onboarding URL

---

## Testing Checklist

### Landing Page (serviceId=1)

**URL:** https://lunaxcode-saas.pages.dev/onboarding?serviceId=1

**Step 1: Project Description**
- Fill in project description
- Click "Continue"

**Step 2: Questionnaire**
- ✅ Scroll to "Which sections would you like to include?" question
- ✅ Verify blue info box appears: "5 essential sections are pre-selected..."
- ✅ Verify 5 sections are checked:
  - [ ] Header (Logo, Navigation)
  - [ ] Hero Section
  - [ ] Features/Benefits
  - [ ] Contact Form
  - [ ] Footer (Copyright, Links)
- ✅ Verify 7 sections are unchecked:
  - [ ] Testimonials
  - [ ] Pricing/Plans
  - [ ] FAQ
  - [ ] About Us
  - [ ] Gallery/Portfolio
  - [ ] Trust Indicators
  - [ ] Video/Demo Section

**Expected Result:** ✅ 5 sections pre-checked, 7 unchecked

---

### Business Website (serviceId=2)

**URL:** https://lunaxcode-saas.pages.dev/onboarding?serviceId=2

**Step 1: Project Description**
- Fill in project description
- Click "Continue"

**Step 2: Questionnaire**
- ✅ Scroll to "Required pages" question
- ✅ Verify blue info box: "6 essential pages are pre-selected..."
- ✅ Verify 6 pages are checked:
  - [ ] Header (Logo, Navigation)
  - [ ] Home
  - [ ] About Us
  - [ ] Services
  - [ ] Contact
  - [ ] Footer (Copyright, Links, Social)
- ✅ Verify 4 pages are unchecked:
  - [ ] Portfolio
  - [ ] Blog
  - [ ] Team
  - [ ] Testimonials

**Expected Result:** ✅ 6 pages pre-checked, 4 unchecked

- ✅ Scroll to "Website features" question
- ✅ Verify blue info box: "2 essential features are pre-selected..."
- ✅ Verify 2 features are checked:
  - [ ] Contact Form
  - [ ] Google Maps
- ✅ Verify 6 features are unchecked:
  - [ ] Blog System
  - [ ] Image Gallery
  - [ ] Video Integration
  - [ ] Newsletter Signup
  - [ ] Social Media Integration
  - [ ] Live Chat

**Expected Result:** ✅ 2 features pre-checked, 6 unchecked

---

## Troubleshooting

### Issue: No pre-selection appearing

**Cause:** SessionStorage has old data from before the update

**Solution:**
```javascript
// Run in browser console
sessionStorage.removeItem('onboardingFormData_1'); // Landing Page
sessionStorage.removeItem('onboardingStep_1');
sessionStorage.removeItem('onboardingFormData_2'); // Business Website
sessionStorage.removeItem('onboardingStep_2');
location.reload();
```

### Issue: Old JavaScript cached

**Cause:** Browser serving cached JS files

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Or use Incognito window

### Issue: Different service type shows wrong data

**Cause:** Service-scoped caching is working correctly

**Explanation:** Each service type (Landing Page, Business Website, etc.) has its own cached data. Switching services will load the appropriate pre-selections for that service type.

---

## Deployment Verification

**Latest Commit:** 25bef49
**Deployment URL:** https://1c9ec444.lunaxcode-saas.pages.dev
**Deployed:** 6 minutes ago
**Status:** ✅ Live

**Included Changes:**
- ✅ Landing Page Header & Footer added
- ✅ Business Website Header & Footer added
- ✅ Pre-selection logic for Landing Page (5 sections)
- ✅ Pre-selection logic for Business Website (6 pages + 2 features)
- ✅ Visual indicators (blue info boxes)
- ✅ Service-scoped sessionStorage
- ✅ Accordion for Add-ons

---

## If Still Not Working

If pre-selection STILL doesn't work after clearing cache/sessionStorage:

1. **Check Browser Console for Errors:**
   - Open DevTools → Console tab
   - Look for JavaScript errors
   - Take screenshot and share

2. **Verify Database Data:**
   ```bash
   # Check Landing Page sections
   npx wrangler d1 execute lunaxcode-prod --remote --command="
   SELECT option_value FROM question_options
   WHERE question_id = (SELECT id FROM questions WHERE question_key = 'sections' AND service_id = 1)
   ORDER BY sort_order;"

   # Check Business Website pages
   npx wrangler d1 execute lunaxcode-prod --remote --command="
   SELECT option_value FROM question_options
   WHERE question_id = (SELECT id FROM questions WHERE question_key = 'pages' AND service_id = 2)
   ORDER BY sort_order;"
   ```

3. **Check Network Tab:**
   - DevTools → Network tab
   - Reload page
   - Check if `/api/questions/1` returns Header and Footer in options

4. **Verify serviceId in URL:**
   - Make sure URL has `?serviceId=1` or `?serviceId=2`
   - If missing, form won't load questions

---

## Success Criteria

✅ **Landing Page:** 5 sections pre-checked (Header, Hero, Features, Contact, Footer)
✅ **Business Website:** 6 pages pre-checked (Header, Home, About, Services, Contact, Footer)
✅ **Business Website:** 2 features pre-checked (Contact Form, Google Maps)
✅ **Visual indicators:** Blue info boxes appear explaining pre-selection
✅ **User control:** Can uncheck or add more options
✅ **Service isolation:** Each service type has its own cached data

---

**Testing Date:** October 29, 2025
**Production URL:** https://lunaxcode-saas.pages.dev
**Status:** ✅ Deployed and ready for testing
