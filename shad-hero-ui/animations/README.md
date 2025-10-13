# Animation Patterns

## Overview

Animation tokens and patterns extracted from HeroUI and shadcn/ui design systems.

## Extracted Animations

### Animation Count

Total animations found: **7 patterns**
- Keyframe animations: 4
- Transition patterns: 3

## Animation Tokens

### Timing Functions

```css
:root {
  /* Easing curves */
  --animation-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --animation-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --animation-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Duration tokens */
  --animation-duration-fast: 150ms;
  --animation-duration-base: 200ms;
  --animation-duration-slow: 300ms;
  --animation-duration-slower: 500ms;
}
```

### Common Transitions

```css
/* Transition tokens */
--transition-all: all var(--animation-duration-base) var(--animation-ease-in-out);
--transition-colors: color var(--animation-duration-base) var(--animation-ease-in-out),
                     background-color var(--animation-duration-base) var(--animation-ease-in-out),
                     border-color var(--animation-duration-base) var(--animation-ease-in-out);
--transition-opacity: opacity var(--animation-duration-base) var(--animation-ease-in-out);
--transition-transform: transform var(--animation-duration-base) var(--animation-ease-out);
```

## Keyframe Animations

### 1. Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--animation-duration-base) var(--animation-ease-in);
}
```

**Usage:**
```tsx
<div className="fade-in">
  Content appears smoothly
</div>
```

### 2. Slide In (From Bottom)

```css
@keyframes slideInFromBottom {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-bottom {
  animation: slideInFromBottom var(--animation-duration-base) var(--animation-ease-out);
}
```

**Usage:**
```tsx
<div className="slide-in-bottom">
  Content slides up
</div>
```

### 3. Scale In

```css
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scale-in {
  animation: scaleIn var(--animation-duration-base) var(--animation-ease-out);
}
```

**Usage:**
```tsx
<Modal className="scale-in">
  Modal content
</Modal>
```

### 4. Spin (Loading)

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

**Usage:**
```tsx
<div className="spinner" role="status" aria-label="Loading">
  <LoadingIcon />
</div>
```

### 5. Pulse

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s var(--animation-ease-in-out) infinite;
}
```

**Usage:**
```tsx
<div className="pulse">
  Pulsing indicator
</div>
```

### 6. Bounce

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.bounce {
  animation: bounce 1s var(--animation-ease-in-out) infinite;
}
```

**Usage:**
```tsx
<div className="bounce">
  Bouncing element
</div>
```

### 7. Shimmer (Skeleton Loading)

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--sp-colors-bg-active) 0%,
    #f0f0f0 50%,
    var(--sp-colors-bg-active) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

**Usage:**
```tsx
<div className="shimmer skeleton">
  Loading skeleton
</div>
```

## Transition Patterns

### Interactive Elements

```css
/* Buttons */
.button {
  transition: var(--transition-all);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.button:active {
  transform: translateY(0);
}

/* Links */
.link {
  transition: var(--transition-colors);
}

.link:hover {
  color: var(--sp-colors-accent);
}

/* Cards */
.card {
  transition: var(--transition-transform), var(--transition-colors);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

### State Transitions

```css
/* Loading states */
.loading {
  transition: var(--transition-opacity);
  opacity: 0.6;
  pointer-events: none;
}

/* Disabled states */
.disabled {
  transition: var(--transition-colors);
  opacity: 0.5;
  cursor: not-allowed;
}

/* Active/Focus states */
.focusable:focus-visible {
  outline: 2px solid var(--sp-colors-accent);
  outline-offset: 2px;
  transition: outline-offset var(--animation-duration-fast);
}
```

## Component-Specific Animations

### Modal/Dialog

```css
/* Backdrop fade */
.modal-backdrop {
  animation: fadeIn var(--animation-duration-base);
}

/* Content scale and fade */
.modal-content {
  animation:
    scaleIn var(--animation-duration-base) var(--animation-ease-out),
    fadeIn var(--animation-duration-base);
}

/* Exit animation */
.modal-exit .modal-backdrop {
  animation: fadeIn var(--animation-duration-base) reverse;
}

.modal-exit .modal-content {
  animation: scaleIn var(--animation-duration-base) reverse;
}
```

### Dropdown/Menu

```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-menu {
  animation: slideDown var(--animation-duration-fast) var(--animation-ease-out);
  transform-origin: top;
}
```

### Toast/Notification

```css
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast {
  animation: slideInFromRight var(--animation-duration-base) var(--animation-ease-out);
}

.toast-exit {
  animation: slideInFromRight var(--animation-duration-base) var(--animation-ease-in) reverse;
}
```

### Accordion/Collapse

```css
.accordion-content {
  transition:
    max-height var(--animation-duration-slow) var(--animation-ease-in-out),
    opacity var(--animation-duration-base);
  overflow: hidden;
}

.accordion-content.collapsed {
  max-height: 0;
  opacity: 0;
}

.accordion-content.expanded {
  max-height: 1000px;
  opacity: 1;
}
```

## Animation Utilities

### React Hook for Animations

```typescript
// hooks/useAnimation.ts
import { useEffect, useRef, useState } from 'react';

export function useAnimation(trigger: boolean, duration = 200) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(trigger);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trigger, duration]);

  return { isVisible, isAnimating };
}
```

**Usage:**
```tsx
function Modal({ isOpen, children }) {
  const { isVisible, isAnimating } = useAnimation(isOpen);

  if (!isVisible) return null;

  return (
    <div className={`modal ${isAnimating ? 'modal-open' : 'modal-closing'}`}>
      {children}
    </div>
  );
}
```

### CSS Animation Helper Classes

```css
/* Animation control */
.animate-none {
  animation: none !important;
}

.animate-paused {
  animation-play-state: paused;
}

.animate-running {
  animation-play-state: running;
}

/* Delay utilities */
.delay-75 {
  animation-delay: 75ms;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-150 {
  animation-delay: 150ms;
}

.delay-200 {
  animation-delay: 200ms;
}

/* Duration utilities */
.duration-75 {
  animation-duration: 75ms;
}

.duration-100 {
  animation-duration: 100ms;
}

.duration-150 {
  animation-duration: 150ms;
}

.duration-200 {
  animation-duration: 200ms;
}

.duration-300 {
  animation-duration: 300ms;
}
```

## Performance Best Practices

### 1. Use `transform` and `opacity`

✅ **Good:**
```css
.element {
  transition: transform 200ms, opacity 200ms;
}
```

❌ **Avoid:**
```css
.element {
  transition: left 200ms, top 200ms, width 200ms;
}
```

### 2. Use `will-change` Sparingly

```css
/* Only for frequently animated elements */
.frequently-animated {
  will-change: transform;
}

/* Remove after animation */
.animated-once {
  animation: slideIn 200ms;
}

.animated-once.animation-complete {
  will-change: auto;
}
```

### 3. Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. Hardware Acceleration

```css
.accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

## Animation Library Integration

### Framer Motion

```tsx
import { motion } from 'framer-motion';

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export function AnimatedCard({ children }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {children}
    </motion.div>
  );
}
```

### React Spring

```tsx
import { useSpring, animated } from '@react-spring/web';

export function SpringCard({ children }) {
  const styles = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 }
  });

  return <animated.div style={styles}>{children}</animated.div>;
}
```

## Testing Animations

### Cypress

```typescript
// cypress/e2e/animations.cy.ts
describe('Animations', () => {
  it('should fade in modal', () => {
    cy.visit('/');
    cy.get('[data-testid="open-modal"]').click();

    cy.get('.modal')
      .should('be.visible')
      .should('have.css', 'animation-name', 'fadeIn');
  });

  it('should respect reduced motion', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win, 'matchMedia').returns({
          matches: true,
          media: '(prefers-reduced-motion: reduce)'
        });
      }
    });

    cy.get('.animated').should('have.css', 'animation-duration', '0.01ms');
  });
});
```

## Animation Checklist

- [ ] All animations use design tokens for duration
- [ ] Transitions use appropriate easing functions
- [ ] `prefers-reduced-motion` is respected
- [ ] Animations are performant (use transform/opacity)
- [ ] Loading states have animation feedback
- [ ] Interactive elements have hover/focus transitions
- [ ] Exit animations match enter animations
- [ ] Animations are tested across browsers

## Resources

- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)
- [Framer Motion](https://www.framer.com/motion/)
- [React Spring](https://www.react-spring.dev/)

---

**Last Updated**: October 2025
**Animation Patterns**: 7 base patterns + utilities
