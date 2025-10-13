# Quick Reference Guide

## 🎨 Design Tokens Cheat Sheet

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--sp-colors-accent` | `#7828c8` | Primary brand color |
| `--sp-colors-fg-active` | `#F4F4F4` | Active foreground |
| `--sp-colors-fg-default` | `#757678` | Default foreground |
| `--sp-colors-bg-active` | `#A258DF2b` | Active background |

### Spacing (4px Grid)

| Token | Value | Rem | Common Use |
|-------|-------|-----|------------|
| `--sp-space-1` | 4px | 0.25rem | Icon padding, borders |
| `--sp-space-2` | 8px | 0.5rem | Tight spacing |
| `--sp-space-3` | 12px | 0.75rem | Button padding |
| `--sp-space-4` | 16px | 1rem | Standard spacing |
| `--sp-space-5` | 20px | 1.25rem | Comfortable spacing |
| `--sp-space-6` | 24px | 1.5rem | Section spacing |
| `--sp-space-7` | 28px | 1.75rem | Large spacing |
| `--sp-space-8` | 32px | 2rem | Component spacing |

### Typography

| Token | Value |
|-------|-------|
| `--sp-font-size` | 14px |

## 🚀 Quick Start

### 1. Import Tokens

**CSS:**
```css
@import 'design-tokens/tokens.css';
```

**JavaScript:**
```javascript
import { tokens } from './design-tokens/tokens.js';
```

**SCSS:**
```scss
@import 'design-tokens/tokens';
```

### 2. Use Tokens

**CSS Example:**
```css
.button {
  background: var(--sp-colors-accent);
  padding: var(--sp-space-3) var(--sp-space-5);
  font-size: var(--sp-font-size);
}
```

**JavaScript Example:**
```javascript
const Button = styled.button`
  background: ${tokens.colors['--sp-colors-accent']};
  padding: ${tokens.spacing['--sp-space-3']};
`;
```

**SCSS Example:**
```scss
.button {
  background: $sp-colors-accent;
  padding: $sp-space-3 $sp-space-5;
}
```

## 📦 Component Count

- **Total**: 671 components
- **HeroUI**: 526 components
- **shadcn/ui**: 145 components

## 📊 Quality Scores

| Metric | Score | Grade |
|--------|-------|-------|
| Consistency | 73/100 | B |
| Accessibility | 84/100 | A |
| Maintainability | 70/100 | B |

## 🔗 Essential Links

- [Full README](README.md) - Complete documentation
- [Component Inventory](components/_component-inventory.md) - All components
- [Interactive Playground](playground/index.html) - Visual explorer
- [Quality Report](quality/metrics-report.md) - Detailed metrics

## 💡 Common Patterns

### Button with Accent Color
```css
.btn-primary {
  background: var(--sp-colors-accent);
  padding: var(--sp-space-3) var(--sp-space-5);
  border-radius: var(--sp-space-2);
}
```

### Card with Standard Spacing
```css
.card {
  padding: var(--sp-space-6);
  gap: var(--sp-space-4);
  background: var(--sp-colors-bg-active);
}
```

### Typography
```css
.text-base {
  font-size: var(--sp-font-size);
  color: var(--sp-colors-fg-default);
}

.text-active {
  color: var(--sp-colors-fg-active);
}
```

## 🎯 Best Practices

1. **Always use spacing tokens** - Don't hardcode pixel values
2. **Follow the 4px grid** - Maintain visual rhythm
3. **Use semantic colors** - Reference tokens by meaning, not appearance
4. **Test accessibility** - Ensure WCAG AA compliance minimum
5. **Check component docs** - Review props and examples before use

## ⚡ Quick Commands

### View Documentation
```bash
# Open playground
open playground/index.html

# Read overview
cat documentation/overview.md

# Check quality
cat quality/metrics-report.md
```

### Use in Project
```bash
# Install dependencies
npm install @heroui-inc/react

# Copy tokens
cp design-tokens/tokens.css src/styles/
```

## 🔍 Token Lookup

### By Use Case

**Spacing:**
- Small gap: `--sp-space-2` (8px)
- Button padding: `--sp-space-3` (12px)
- Section margin: `--sp-space-6` (24px)
- Component spacing: `--sp-space-8` (32px)

**Colors:**
- Brand/Primary: `--sp-colors-accent`
- Active text: `--sp-colors-fg-active`
- Default text: `--sp-colors-fg-default`
- Active background: `--sp-colors-bg-active`

## 📋 File Locations

```
shad-hero-ui/
├── design-tokens/
│   ├── tokens.css      ← CSS variables
│   ├── tokens.scss     ← SCSS variables
│   ├── tokens.js       ← JS constants
│   └── tokens.json     ← Raw data
├── components/         ← Component docs
├── playground/         ← Interactive demo
└── quality/            ← Quality reports
```

## 🎨 Color Palette

### Primary
- Accent: `#7828c8` (Purple)

### Foreground
- Active: `#F4F4F4` (Light gray)
- Default: `#757678` (Medium gray)

### Background
- Active: `#A258DF2b` (Purple transparent)

### Utility Colors
- Black: `#000000`
- White: `#fff`
- Dark: `#292929`
- Light: `#d4d4d4`
- Border: `#161616`

## 🛠️ Developer Tips

1. **Use the playground first** - Visualize tokens before coding
2. **Reference component inventory** - Find existing solutions
3. **Check accessibility scores** - Components rated 0-100
4. **Follow spacing scale** - Stick to defined increments
5. **Keep tokens consistent** - Don't create one-off values

## 📱 Framework Support

- ✅ React (Primary)
- ✅ TypeScript
- ✅ CSS/SCSS
- ✅ Tailwind CSS (compatible)
- ✅ Styled Components
- ✅ Emotion

## 🔄 Update Process

To update this design system:

1. Re-run extraction tool
2. Review new tokens
3. Update your imports
4. Test breaking changes
5. Update documentation

---

**Last Updated**: October 2025
**Quick Reference Version**: 1.0
