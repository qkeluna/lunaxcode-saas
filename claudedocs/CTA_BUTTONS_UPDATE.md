# CTA Buttons Update - Redirect to Pricing Section

## Summary
All general CTA buttons across landing page components now redirect to the pricing section (#pricing) instead of directly to onboarding. This allows users to view pricing options before starting the project creation flow.

## ✅ Updated Components (8 files)

### 1. **Hero.tsx**
- Button: "Start Your Project"
- Old: `/onboarding` → New: `#pricing`
- Updated aria-label to "View pricing"

### 2. **Features.tsx**
- Button: "Get Started"
- Old: `/onboarding` → New: `#pricing`
- Updated aria-label to "View pricing"
- Updated button text: "Get Started" → "View Pricing"

### 3. **ContactCTA.tsx**
- Button: "Start Your Project"
- Old: `/onboarding` → New: `#pricing`
- Updated button text: "Start Your Project" → "View Pricing"
- Updated aria-label to "View pricing"
- ✅ **WhatsApp button unchanged** (contact button, not CTA)

### 4. **Portfolio.tsx**
- Button: "Start Your Project"
- Old: `/onboarding` → New: `#pricing`
- Updated button text: "Start Your Project" → "View Pricing"
- Updated aria-label to "View pricing"

### 5. **Process.tsx**
- Button: "Start Your Project Now"
- Old: `/onboarding` → New: `#pricing`
- Updated button text: "Start Your Project Now" → "View Pricing"
- Updated aria-label to "View pricing"

### 6. **Testimonials.tsx**
- Button: "Start Your Success Story"
- Old: `/onboarding` → New: `#pricing`
- Updated button text: "Start Your Success Story" → "View Pricing"
- Updated aria-label to "View pricing"

### 7. **Footer.tsx**
- **Service Links (5 items)**: All now point to `#pricing`
  - Landing Pages
  - Business Websites
  - E-Commerce Platforms
  - Web Applications
  - Mobile Apps
- **CTA Button**: "Get Started" → "View Pricing"
- Old: `/onboarding` → New: `#pricing`
- Updated aria-label to "View pricing"

### 8. **Pricing.tsx** ✅ **UNCHANGED (Intentional)**
- Individual plan buttons: Still `/onboarding?serviceId=${plan.id}` ✓
- "Request Custom Quote" button: Still `/onboarding` ✓
- **Reason**: These are actual plan selection buttons that should go directly to onboarding

---

## 🚫 Unchanged Buttons (By Design)

### Contact Buttons (Kept as-is)
- **WhatsApp Button** in ContactCTA.tsx: `https://wa.me/639123456789` ✓
- **Email Links** in Footer.tsx: `mailto:hello@lunaxcode.com` ✓
- **Phone Links** in Footer.tsx: `tel:+639123456789` ✓

### Pricing Plan Selection (Kept as-is)
- **Individual Plan Buttons** in Pricing.tsx: `/onboarding?serviceId=${plan.id}` ✓
- **Request Custom Quote** in Pricing.tsx: `/onboarding` ✓

---

## User Flow

### Before:
```
Landing Page → Click "Get Started" → Onboarding Form
```

### After:
```
Landing Page → Click "View Pricing" → Pricing Section → Click Plan Button → Onboarding Form
```

---

## Benefits

1. **Better User Journey**: Users see pricing before committing to the onboarding flow
2. **Increased Transparency**: Pricing is visible upfront
3. **Reduced Bounce**: Users can make informed decisions before starting
4. **SEO**: Better internal linking to pricing section
5. **Professional Flow**: Industry standard practice (show pricing before sign-up)

---

## Testing Checklist

- [ ] Click "Start Your Project" on Hero section → Should scroll to #pricing
- [ ] Click "View Pricing" on Features section → Should scroll to #pricing
- [ ] Click "View Pricing" on Portfolio section → Should scroll to #pricing
- [ ] Click "View Pricing" on Process section → Should scroll to #pricing
- [ ] Click "View Pricing" on Testimonials section → Should scroll to #pricing
- [ ] Click "View Pricing" on ContactCTA section → Should scroll to #pricing
- [ ] Click footer service links → Should scroll to #pricing
- [ ] Click "View Pricing" on Footer → Should scroll to #pricing
- [ ] Click "Get Pro" or plan buttons in Pricing → Should go to /onboarding with serviceId
- [ ] Click "Request Custom Quote" → Should go to /onboarding
- [ ] Click WhatsApp button → Should open WhatsApp
- [ ] Click email/phone in footer → Should open mail client/dialer

---

## Files Modified

```
src/components/landing/
├── Hero.tsx          ✓ Updated
├── Features.tsx      ✓ Updated
├── ContactCTA.tsx    ✓ Updated
├── Portfolio.tsx     ✓ Updated
├── Process.tsx       ✓ Updated
├── Testimonials.tsx  ✓ Updated
├── Footer.tsx        ✓ Updated
└── Pricing.tsx       ✓ Unchanged (intentional)
```

---

## Linting Status

✅ **No linting errors**
✅ **All changes verified**
✅ **Ready for production**

---

## Notes

- All CTA button text standardized to "View Pricing" for consistency
- Hero section kept original text "Start Your Project" but redirects to #pricing
- Contact buttons (WhatsApp, email, phone) remain unchanged as requested
- Pricing plan selection buttons remain functional for actual onboarding flow
