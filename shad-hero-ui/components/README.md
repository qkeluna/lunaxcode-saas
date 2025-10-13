# Component Library

## Overview

Comprehensive component library combining **HeroUI** (526 components) and **shadcn/ui** (145 components) for a total of **671 React components**.

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Components | 671 |
| Framework | React + TypeScript |
| HeroUI Components | 526 (78.4%) |
| shadcn/ui Components | 145 (21.6%) |
| Average Complexity | 35/100 |
| Accessibility Score | 84/100 |

## Component Categories

### Layout & Structure (Est. ~80 components)

**Grid Systems:**
- Responsive grid layouts
- Flex containers
- Stack components (vertical/horizontal)
- Container wrappers
- Spacer utilities

**Navigation:**
- Navbar/Header components
- Sidebar navigation
- Breadcrumbs
- Tabs
- Pagination
- Bottom navigation (mobile)

### Form Components (Est. ~120 components)

**Input Controls:**
- Text input variants
- Textarea
- Number input
- Password input with toggle
- Search input
- OTP/PIN input

**Selection Controls:**
- Select/Dropdown
- Autocomplete
- Multi-select
- Checkbox
- Radio buttons
- Switch/Toggle
- Slider (range)
- Date picker
- Time picker
- Color picker

**Form Utilities:**
- Form validation
- Form groups
- Field labels
- Helper text
- Error messages
- Form layouts

### Buttons & Actions (Est. ~60 components)

- Button variants (primary, secondary, ghost, outline)
- Icon buttons
- Button groups
- Split buttons
- Floating action buttons (FAB)
- Loading buttons
- Link buttons

### Data Display (Est. ~90 components)

**Tables:**
- Data table
- Sortable table
- Paginated table
- Expandable rows
- Row selection
- Column resizing

**Lists:**
- Simple lists
- Ordered/unordered lists
- Description lists
- Avatar lists
- Timeline lists

**Data Visualization:**
- Progress bars
- Progress rings
- Stat cards
- Metric displays
- Badges
- Tags/Chips
- Labels
- Status indicators

### Feedback & Messaging (Est. ~70 components)

**Overlays:**
- Modal/Dialog
- Drawer/Sheet
- Popover
- Tooltip
- Alert dialog
- Confirmation dialog

**Notifications:**
- Toast notifications
- Alert banners
- Snackbar
- Status messages
- Empty states
- Error boundaries

**Progress:**
- Linear progress
- Circular progress
- Skeleton loaders
- Shimmer effects
- Infinite scroll loaders

### Typography (Est. ~30 components)

- Heading variants (H1-H6)
- Paragraph
- Text utilities
- Code blocks
- Blockquote
- Links
- Lists
- Truncation utilities

### Media (Est. ~40 components)

- Image components
- Avatar (single, group)
- Icon library
- Image galleries
- Lightbox
- Video player
- Audio player
- File upload previews

### Navigation (Est. ~50 components)

- Menu components
- Context menus
- Command palette
- Sidebar
- Navigation bar
- Mobile menu
- Mega menu
- Step indicators/Steppers

### Cards (Est. ~35 components)

- Basic card
- Media card
- Product card
- Profile card
- Pricing card
- Feature card
- Testimonial card
- Dashboard widgets

### Utility Components (Est. ~96 components)

- Divider/Separator
- Spacer
- Portal
- Transition wrappers
- Visibility controls
- Responsive utilities
- Theme switcher
- Accessibility utilities

## Component Quality Metrics

### By Framework

**HeroUI Components (526):**
- Average Complexity: 32/100
- Test Coverage: ~40%
- Accessibility: 84/100
- TypeScript: 100%

**shadcn/ui Components (145):**
- Average Complexity: 42/100
- Test Coverage: ~35%
- Accessibility: 78/100
- TypeScript: 100%

### Complexity Distribution

```
Low Complexity (0-25):     35% of components
Medium Complexity (26-50): 50% of components
High Complexity (51-75):   13% of components
Very High (76-100):        2% of components
```

## Using Components

### Import from HeroUI

```tsx
import {
  Button,
  Input,
  Card,
  Modal
} from '@heroui-inc/react';

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

### Import from shadcn/ui

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

## Component Naming Conventions

### HeroUI
- PascalCase for components: `Button`, `TextField`, `DataTable`
- Descriptive prop names: `isDisabled`, `isLoading`, `variant`
- Prefix boolean props with `is`, `has`, or `should`

### shadcn/ui
- kebab-case for file names: `button.tsx`, `data-table.tsx`
- PascalCase for components: `Button`, `DataTable`
- Variant-based API: `variant="primary"`, `size="lg"`

## Accessibility Features

All components include:

- ✅ ARIA attributes where appropriate
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader compatibility
- ✅ Semantic HTML structure
- ✅ Color contrast compliance (WCAG AA)

### Accessibility Scores by Category

| Category | Average Score |
|----------|---------------|
| Forms | 88/100 |
| Buttons | 90/100 |
| Navigation | 82/100 |
| Overlays | 80/100 |
| Data Display | 84/100 |
| Media | 78/100 |

## Component Props Patterns

### Common Props Across Components

```typescript
// Size variants
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Color/Variant
variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline'
color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

// State
isDisabled?: boolean
isLoading?: boolean
isReadOnly?: boolean
isRequired?: boolean

// Styling
className?: string
style?: React.CSSProperties
```

### Example: Button Props

```typescript
interface ButtonProps {
  // Content
  children?: React.ReactNode
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode

  // Appearance
  variant?: 'solid' | 'outline' | 'ghost' | 'link'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'

  // State
  isDisabled?: boolean
  isLoading?: boolean
  isIconOnly?: boolean

  // Interaction
  onClick?: (e: React.MouseEvent) => void
  onPress?: () => void

  // HTML
  type?: 'button' | 'submit' | 'reset'
  form?: string

  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
}
```

## Component Composition

### Example: Building a Form

```tsx
import { Card, Input, Button, Select, Switch } from '@heroui-inc/react';

export function UserForm() {
  return (
    <Card>
      <form>
        <Input
          label="Name"
          placeholder="Enter your name"
          isRequired
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          isRequired
        />

        <Select label="Country">
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
        </Select>

        <Switch>Subscribe to newsletter</Switch>

        <Button type="submit" color="primary">
          Submit
        </Button>
      </form>
    </Card>
  );
}
```

## Theming & Customization

### Using Design Tokens

```tsx
import styled from 'styled-components';

const CustomButton = styled.button`
  background: var(--sp-colors-accent);
  padding: var(--sp-space-3) var(--sp-space-5);
  border-radius: var(--sp-space-2);
  font-size: var(--sp-font-size);
  color: var(--sp-colors-fg-active);

  &:hover {
    background: var(--sp-colors-bg-active);
  }
`;
```

### Component Variants

```tsx
// Using HeroUI variants
<Button variant="solid" color="primary">Primary</Button>
<Button variant="outline" color="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Using shadcn/ui variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
```

## Performance Considerations

### Code Splitting

```tsx
// Lazy load heavy components
const DataTable = lazy(() => import('./components/DataTable'));
const Chart = lazy(() => import('./components/Chart'));

function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DataTable data={data} />
      <Chart data={chartData} />
    </Suspense>
  );
}
```

### Tree Shaking

Both libraries support tree shaking:

```tsx
// ✅ Good - imports only what you need
import { Button } from '@heroui-inc/react';

// ❌ Avoid - imports entire library
import * as HeroUI from '@heroui-inc/react';
```

## Component Documentation

### Full Component Inventory

See [_component-inventory.md](./_component-inventory.md) for the complete list of all 671 components organized by framework.

### Individual Component Docs

Each component has its own documentation in subdirectories:
- Props and TypeScript interfaces
- Usage examples
- Accessibility notes
- Dependencies
- Complexity metrics

## Testing Components

### Unit Testing Example

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@heroui-inc/react';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isDisabled is true', () => {
    render(<Button isDisabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Migration Guide

### From Material-UI to HeroUI

```tsx
// Material-UI
import { Button, TextField } from '@mui/material';

// HeroUI equivalent
import { Button, Input } from '@heroui-inc/react';
```

### From Ant Design to shadcn/ui

```tsx
// Ant Design
import { Button, Input } from 'antd';

// shadcn/ui equivalent
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

## Component Comparison

### Button Comparison

| Feature | HeroUI | shadcn/ui |
|---------|--------|-----------|
| Variants | 5 | 5 |
| Sizes | 5 | 4 |
| Colors | 7 | N/A |
| Icons | ✅ | ✅ |
| Loading State | ✅ | Manual |
| Disabled State | ✅ | ✅ |

### Input Comparison

| Feature | HeroUI | shadcn/ui |
|---------|--------|-----------|
| Label | Built-in | Separate |
| Error State | ✅ | Manual |
| Helper Text | ✅ | Manual |
| Clear Button | ✅ | Manual |
| Icons | ✅ | ✅ |

## Resources

- [HeroUI Documentation](https://heroui.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Design Tokens](../design-tokens/) - Token definitions
- [Animation Patterns](../animations/) - Animation guides
- [Accessibility Guide](../quality/metrics-report.md#accessibility) - A11y standards

## Contributing

To add components to this documentation:

1. Create component subdirectory: `components/[component-name]/`
2. Add `[component-name].md` with:
   - Metadata (framework, LOC, complexity)
   - Props interface
   - Usage examples
   - Accessibility notes
   - Dependencies
3. Update `_component-inventory.md`

---

**Total Components**: 671
**Last Updated**: October 2025
**Frameworks**: React + TypeScript
