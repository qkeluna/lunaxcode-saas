# HeroUI & shadcn/ui Unified Design System

> Automatically extracted and merged design system from [HeroUI](https://github.com/heroui-inc/heroui) and [shadcn/ui](https://github.com/shadcn-ui/ui)

## 📊 Overview

This comprehensive design system combines the best elements from both HeroUI and shadcn/ui, providing a unified foundation for building modern, accessible React applications.

### Statistics

- **🎨 Colors**: 18 tokens
- **📝 Typography**: 2 tokens
- **📏 Spacing**: 9 tokens (4px base grid system)
- **🧩 Components**: 671 components
- **✨ Animations**: 7 patterns

### Quality Metrics

- **Consistency**: 73/100
- **Accessibility**: 84/100
- **Maintainability**: 70/100

## 🚀 Quick Start

### 1. Explore Design Tokens

Navigate to [design-tokens/](design-tokens/) to find tokens in multiple formats:

- **CSS**: [tokens.css](design-tokens/tokens.css) - CSS Custom Properties
- **SCSS**: [tokens.scss](design-tokens/tokens.scss) - SCSS Variables
- **JavaScript**: [tokens.js](design-tokens/tokens.js) - ES6 Module
- **JSON**: [tokens.json](design-tokens/tokens.json) - Raw Token Data

### 2. Browse Components

Visit [components/](components/) to explore:

- Component inventory with 671 React components
- Individual component documentation
- Props, dependencies, and complexity metrics
- Accessibility scores

### 3. Interactive Playground

Open [playground/index.html](playground/index.html) in your browser to:

- Explore all design tokens visually
- See color swatches with values
- Interactive component preview
- Test token combinations

### 4. Quality Reports

Check [quality/](quality/) for:

- Comprehensive quality metrics
- Accessibility audit results
- Consistency analysis
- Recommendations for improvements

## 📁 Documentation Structure

```
shad-hero-ui/
├── documentation/          # Overview and guides
│   └── overview.md
├── design-tokens/          # Token definitions
│   ├── tokens.css         # CSS Custom Properties
│   ├── tokens.scss        # SCSS Variables
│   ├── tokens.js          # JavaScript/TypeScript
│   └── tokens.json        # Raw JSON Data
├── components/            # Component documentation
│   ├── _component-inventory.md
│   └── [component-name]/
├── patterns/              # Design patterns
├── animations/            # Animation patterns
├── quality/               # Quality reports
│   └── metrics-report.md
├── visualizations/        # Component graphs
│   └── component-relationships.md
├── playground/            # Interactive playground
│   └── index.html
├── ai-integration/        # AI tool guides
├── analytics/             # Usage analytics
└── exports/               # Export utilities
```

## 🎨 Design Tokens

### Colors

The system includes 18 color tokens from both libraries:

- **Primary Colors**: Accent and brand colors
- **Foreground Colors**: Text and UI element colors
- **Background Colors**: Surface and container colors
- **Semantic Colors**: Success, warning, error states

### Typography

- **Font Size**: `--sp-font-size: 14px` (base)
- Consistent type scale across components

### Spacing

Based on a **4px grid system**:

- `--sp-space-1`: 4px
- `--sp-space-2`: 8px
- `--sp-space-3`: 12px
- `--sp-space-4`: 16px
- `--sp-space-5`: 20px
- `--sp-space-6`: 24px
- `--sp-space-7`: 28px
- `--sp-space-8`: 32px

## 🧩 Components

### Component Breakdown

The unified system includes **671 components** from both libraries:

- **HeroUI**: 526 components
- **shadcn/ui**: 145 components

### Framework

All components are built with:

- **React** with TypeScript
- Modern hooks-based architecture
- Accessible by default

### Component Features

- ✅ Full TypeScript support
- ✅ Comprehensive prop interfaces
- ✅ Dependency tracking
- ✅ Complexity metrics
- ✅ Test coverage indicators

## ♿ Accessibility

The design system achieves an **84/100 accessibility score**:

- ARIA attributes in interactive components
- Semantic HTML structure
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### Areas for Improvement

1. Add missing ARIA labels to some components
2. Enhance keyboard navigation in complex widgets
3. Improve focus indicators
4. Add skip links for navigation

## 📊 Quality Analysis

### Consistency (73/100)

**Strengths:**
- Well-organized color palette
- Systematic spacing scale
- Consistent naming patterns

**Improvements Needed:**
- Standardize component prop naming
- Consolidate duplicate tokens
- Align animation timing functions

### Maintainability (70/100)

- Component complexity is well-managed
- Clear file structure
- Good separation of concerns

**Recommendations:**
- Increase test coverage
- Add inline documentation
- Create component usage examples

## 🎯 Usage Examples

### Using Design Tokens

**CSS:**
```css
.button {
  background-color: var(--sp-colors-accent);
  padding: var(--sp-space-3) var(--sp-space-5);
  font-size: var(--sp-font-size);
}
```

**JavaScript:**
```javascript
import { tokens } from './design-tokens/tokens.js';

const Button = styled.button`
  background-color: ${tokens.colors['--sp-colors-accent']};
  padding: ${tokens.spacing['--sp-space-3']} ${tokens.spacing['--sp-space-5']};
`;
```

**SCSS:**
```scss
@import 'design-tokens/tokens';

.button {
  background-color: $sp-colors-accent;
  padding: $sp-space-3 $sp-space-5;
  font-size: $sp-font-size;
}
```

## 🔄 Comparison: HeroUI vs shadcn/ui

### HeroUI
- **Strengths**: Extensive component library, robust theming
- **Components**: 526 components
- **Consistency**: 81/100
- **Accessibility**: 84/100

### shadcn/ui
- **Strengths**: Developer experience, customization
- **Components**: 145 components
- **Consistency**: 68/100
- **Accessibility**: 78/100

### Unified System
- Best of both worlds
- 671 total components
- Balanced consistency and flexibility
- Strong accessibility foundation

## 🛠️ Integration

### Install Dependencies

```bash
npm install @heroui-inc/react
# or
npm install shadcn-ui
```

### Import Tokens

```javascript
// Import CSS tokens
import './shad-hero-ui/design-tokens/tokens.css';

// Or import JS tokens
import { tokens } from './shad-hero-ui/design-tokens/tokens.js';
```

### Use in Your Project

```jsx
import { Button } from '@heroui-inc/react';

export function App() {
  return (
    <Button
      style={{
        background: 'var(--sp-colors-accent)',
        padding: 'var(--sp-space-3)'
      }}
    >
      Click Me
    </Button>
  );
}
```

## 📈 Future Improvements

1. **Token Consolidation**: Merge duplicate color and spacing tokens
2. **Enhanced Typography**: Add complete type scale with line heights and weights
3. **Dark Mode**: Extract and document dark mode color palettes
4. **Animation Library**: Expand animation patterns with timing functions
5. **Component Templates**: Create boilerplate templates for common patterns
6. **Theme Builder**: Interactive tool for customizing tokens
7. **Figma Integration**: Export tokens to Figma design files

## 🤝 Contributing

This design system was automatically extracted. To contribute:

1. Submit issues or improvements to the source repositories:
   - [HeroUI GitHub](https://github.com/heroui-inc/heroui)
   - [shadcn/ui GitHub](https://github.com/shadcn-ui/ui)

2. Re-run the extraction tool to update this documentation

## 📄 License

This documentation follows the licenses of the source projects:

- **HeroUI**: Check their [repository](https://github.com/heroui-inc/heroui)
- **shadcn/ui**: Check their [repository](https://github.com/shadcn-ui/ui)

## 🔗 Resources

- [HeroUI Documentation](https://heroui.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Interactive Playground](playground/index.html)
- [Component Inventory](components/_component-inventory.md)
- [Quality Metrics](quality/metrics-report.md)

---

**Generated**: October 2025
**Extractor Version**: 1.0.0
**Source Repositories**: HeroUI v2.x, shadcn/ui latest
