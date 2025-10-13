# AI Integration Guide

## Overview

This guide helps you integrate the HeroUI + shadcn/ui design system with AI development tools and workflows.

## Supported AI Tools

### 1. Claude Code (Anthropic)

**Integration Method:**
```bash
# Add design system context to Claude Code
cp design-tokens/tokens.json ~/.claude/context/
```

**Usage in Prompts:**
```
"Generate a button component using tokens from shad-hero-ui:
- Use --sp-colors-accent for background
- Use --sp-space-3 for vertical padding
- Use --sp-space-5 for horizontal padding"
```

### 2. GitHub Copilot

**Setup:**
Add to your workspace `.vscode/settings.json`:
```json
{
  "github.copilot.inlineSuggest.enable": true,
  "github.copilot.advanced": {
    "contextFiles": [
      "shad-hero-ui/design-tokens/tokens.json",
      "shad-hero-ui/components/_component-inventory.md"
    ]
  }
}
```

**Comment-Driven Development:**
```typescript
// Create a primary button using design system tokens
// Background: --sp-colors-accent
// Padding: --sp-space-3 vertical, --sp-space-5 horizontal
const PrimaryButton = styled.button`
  // Copilot will suggest using the tokens
`;
```

### 3. Cursor AI

**Project Context:**
Add to `.cursor/context.json`:
```json
{
  "designSystem": {
    "tokens": "./shad-hero-ui/design-tokens/tokens.json",
    "components": "./shad-hero-ui/components/_component-inventory.md",
    "patterns": "./shad-hero-ui/patterns/"
  }
}
```

**AI Rules:**
Create `.cursorrules`:
```
# Design System Rules
- Always use design tokens from shad-hero-ui
- Follow 4px spacing grid (--sp-space-1 through --sp-space-8)
- Use --sp-colors-accent for primary actions
- Ensure WCAG AA accessibility compliance
```

### 4. v0 by Vercel

**Component Generation:**
```
Prompt: "Create a card component using shadcn/ui tokens:
- Border radius: --sp-space-2
- Padding: --sp-space-6
- Gap between elements: --sp-space-4
- Use semantic HTML for accessibility"
```

### 5. ChatGPT / GPT-4

**Context Priming:**
```
I'm using a design system with these tokens:
- Colors: --sp-colors-accent (#7828c8), --sp-colors-fg-active, --sp-colors-fg-default
- Spacing: 4px grid from --sp-space-1 (4px) to --sp-space-8 (32px)
- Components: 671 React components (HeroUI + shadcn/ui)

Please generate code using these tokens exclusively.
```

## Token Reference for AI

### Quick Token Map

Provide this to AI assistants:

```json
{
  "colors": {
    "primary": "--sp-colors-accent",
    "textActive": "--sp-colors-fg-active",
    "textDefault": "--sp-colors-fg-default",
    "bgActive": "--sp-colors-bg-active"
  },
  "spacing": {
    "xs": "--sp-space-1",
    "sm": "--sp-space-2",
    "md": "--sp-space-3",
    "lg": "--sp-space-4",
    "xl": "--sp-space-5",
    "2xl": "--sp-space-6",
    "3xl": "--sp-space-7",
    "4xl": "--sp-space-8"
  },
  "typography": {
    "base": "--sp-font-size"
  }
}
```

## AI Prompt Templates

### Component Generation

```
Generate a [COMPONENT_NAME] component using the shad-hero-ui design system:

Requirements:
- Use semantic HTML
- Include ARIA attributes for accessibility
- Use design tokens:
  - Primary color: --sp-colors-accent
  - Spacing: --sp-space-[1-8]
  - Font size: --sp-font-size
- Include TypeScript types
- Add JSDoc comments

Example token usage:
background: var(--sp-colors-accent);
padding: var(--sp-space-3) var(--sp-space-5);
```

### Refactoring Prompt

```
Refactor this component to use shad-hero-ui tokens:

Current code:
[PASTE CODE]

Replace:
- Hardcoded colors with --sp-colors-* tokens
- Pixel values with --sp-space-* tokens (4px grid)
- Font sizes with --sp-font-size

Maintain:
- Existing functionality
- Component API
- Accessibility features
```

### Style Consistency Check

```
Review this code for design system compliance:

Code:
[PASTE CODE]

Check for:
1. All colors use CSS custom properties (--sp-colors-*)
2. Spacing follows 4px grid (--sp-space-*)
3. No hardcoded pixel values
4. Semantic HTML usage
5. ARIA attributes present

Provide:
- List of violations
- Corrected code
```

## AI-Assisted Workflows

### 1. Component Discovery

**Prompt:**
```
Search the component inventory for components similar to:
[DESCRIBE COMPONENT]

From these 671 components:
- HeroUI: 526 components
- shadcn/ui: 145 components

Suggest the 3 most relevant components with their file paths.
```

### 2. Token Migration

**Prompt:**
```
Migrate this legacy code to use shad-hero-ui tokens:

Legacy CSS:
[PASTE CSS]

Convert:
- #7828c8 → var(--sp-colors-accent)
- 12px padding → var(--sp-space-3)
- 16px margin → var(--sp-space-4)
```

### 3. Accessibility Enhancement

**Prompt:**
```
Enhance this component for accessibility (target: 84/100 score):

Component:
[PASTE CODE]

Add:
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

Reference: System accessibility score is 84/100
```

## LLM Context Files

### For Long Context Models (100K+ tokens)

Include entire design system:
```bash
cat shad-hero-ui/design-tokens/tokens.json
cat shad-hero-ui/components/_component-inventory.md
cat shad-hero-ui/quality/metrics-report.md
```

### For Standard Context Models (8K-32K tokens)

Include essential references:
```bash
cat shad-hero-ui/QUICK_REFERENCE.md
cat shad-hero-ui/design-tokens/tokens.json
```

## AI Code Review Checklist

Use AI to verify:

- [ ] All colors use design tokens (no hardcoded hex values)
- [ ] Spacing follows 4px grid system
- [ ] Components have TypeScript types
- [ ] Accessibility attributes present (ARIA, semantic HTML)
- [ ] Component complexity is reasonable (<50)
- [ ] Follows existing component patterns

**Review Prompt:**
```
Review this code against the shad-hero-ui design system checklist:

Code:
[PASTE CODE]

Verify:
1. Token usage (colors, spacing, typography)
2. TypeScript type safety
3. Accessibility (WCAG AA target)
4. Component complexity
5. Pattern consistency

Provide detailed feedback with examples.
```

## AI Training Data

### Fine-Tuning Dataset Format

For custom model training:

```jsonl
{"prompt": "Create a button with accent color and medium padding", "completion": "const Button = styled.button`\n  background: var(--sp-colors-accent);\n  padding: var(--sp-space-3) var(--sp-space-5);\n`;"}
{"prompt": "Add semantic spacing between card elements", "completion": "gap: var(--sp-space-4);"}
```

### Few-Shot Examples

Provide these examples to AI:

```typescript
// Example 1: Primary Button
const PrimaryButton = styled.button`
  background: var(--sp-colors-accent);
  color: var(--sp-colors-fg-active);
  padding: var(--sp-space-3) var(--sp-space-5);
  border-radius: var(--sp-space-2);
  font-size: var(--sp-font-size);
`;

// Example 2: Card Component
const Card = styled.div`
  padding: var(--sp-space-6);
  gap: var(--sp-space-4);
  background: var(--sp-colors-bg-active);
  border-radius: var(--sp-space-2);
`;

// Example 3: List with Spacing
const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--sp-space-3);
  padding: var(--sp-space-4);
`;
```

## Integration with AI Development Tools

### Codeium

Add to workspace config:
```json
{
  "codeium.enableSearch": true,
  "codeium.contextFiles": [
    "shad-hero-ui/design-tokens/*.json",
    "shad-hero-ui/components/*.md"
  ]
}
```

### Tabnine

Create `.tabnine/context.json`:
```json
{
  "designSystem": "shad-hero-ui",
  "tokenFiles": [
    "design-tokens/tokens.json"
  ]
}
```

### Amazon CodeWhisperer

Reference tokens in comments:
```typescript
// Use design system tokens from shad-hero-ui
// Primary color: --sp-colors-accent
// Spacing grid: 4px increments (--sp-space-1 to --sp-space-8)
```

## Best Practices for AI Collaboration

1. **Always provide token context** in prompts
2. **Reference component inventory** when asking for similar components
3. **Include accessibility requirements** (target: 84/100)
4. **Specify spacing using grid system** (4px increments)
5. **Request TypeScript types** for all components
6. **Ask for JSDoc comments** on complex logic
7. **Verify token usage** in AI-generated code

## Troubleshooting AI Integration

### Issue: AI generates hardcoded values

**Solution:**
```
Update your prompt with explicit token requirements:
"IMPORTANT: Use only design tokens. No hardcoded colors or spacing values."
```

### Issue: AI doesn't follow spacing grid

**Solution:**
```
Specify: "Use 4px spacing grid (--sp-space-1 through --sp-space-8 only).
Reject values like 5px, 15px, 18px that don't fit the grid."
```

### Issue: Generated code lacks accessibility

**Solution:**
```
Add to prompt: "Target accessibility score: 84/100.
Include ARIA attributes, semantic HTML, keyboard navigation."
```

## Resources

- [Design Tokens](../design-tokens/) - All token definitions
- [Component Inventory](../components/_component-inventory.md) - 671 components
- [Quick Reference](../QUICK_REFERENCE.md) - Developer cheat sheet
- [Quality Metrics](../quality/metrics-report.md) - System standards

---

**Last Updated**: October 2025
**AI Tools Tested**: Claude Code, GitHub Copilot, Cursor, GPT-4, v0
