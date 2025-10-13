# Design System Analytics

## Overview

Track design system adoption, usage patterns, and health metrics across your organization.

## Key Metrics

### Adoption Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Components | 671 | - | ✅ Complete |
| Token Coverage | 29 tokens | 50+ | 🟡 Growing |
| Component Frameworks | React/TS | Multi-framework | 🟡 In Progress |
| Accessibility Score | 84/100 | 90/100 | 🟢 Good |
| Consistency Score | 73/100 | 85/100 | 🟡 Improving |

### Usage Statistics

```
Components by Source:
├── HeroUI: 526 components (78.4%)
└── shadcn/ui: 145 components (21.6%)

Token Distribution:
├── Colors: 18 tokens (62.1%)
├── Spacing: 9 tokens (31.0%)
└── Typography: 2 tokens (6.9%)
```

## Tracking Token Usage

### Implementation

**Track via CSS:**
```javascript
// analytics/token-tracker.js
export function trackTokenUsage() {
  const allStyles = document.querySelectorAll('*');
  const tokenUsage = {};

  allStyles.forEach(el => {
    const computed = getComputedStyle(el);

    // Track color tokens
    if (computed.backgroundColor.includes('var(--sp-colors')) {
      const token = computed.backgroundColor.match(/var\((--sp-colors-[^)]+)\)/)?.[1];
      tokenUsage[token] = (tokenUsage[token] || 0) + 1;
    }

    // Track spacing tokens
    ['padding', 'margin', 'gap'].forEach(prop => {
      if (computed[prop].includes('var(--sp-space')) {
        const token = computed[prop].match(/var\((--sp-space-[^)]+)\)/)?.[1];
        tokenUsage[token] = (tokenUsage[token] || 0) + 1;
      }
    });
  });

  return tokenUsage;
}
```

**Track via Build Tools:**
```javascript
// webpack.config.js or vite.config.js
export default {
  plugins: [
    {
      name: 'design-system-analytics',
      transform(code, id) {
        if (id.endsWith('.css') || id.endsWith('.tsx')) {
          // Extract token usage
          const tokens = code.match(/var\(--sp-[^)]+\)/g) || [];
          // Send to analytics
          console.log('Tokens used:', new Set(tokens));
        }
      }
    }
  ]
}
```

## Component Usage Analytics

### Track Component Imports

```typescript
// analytics/component-tracker.ts
interface ComponentUsage {
  name: string;
  imports: number;
  renders: number;
  source: 'heroui' | 'shadcn';
}

export class ComponentAnalytics {
  private usage: Map<string, ComponentUsage> = new Map();

  trackImport(componentName: string, source: 'heroui' | 'shadcn') {
    const current = this.usage.get(componentName) || {
      name: componentName,
      imports: 0,
      renders: 0,
      source
    };

    current.imports++;
    this.usage.set(componentName, current);
  }

  trackRender(componentName: string) {
    const current = this.usage.get(componentName);
    if (current) {
      current.renders++;
    }
  }

  getReport() {
    return Array.from(this.usage.values())
      .sort((a, b) => b.imports - a.imports);
  }
}
```

## Health Metrics

### Design System Health Score

**Formula:**
```
Health Score = (
  Consistency * 0.30 +
  Accessibility * 0.35 +
  Maintainability * 0.20 +
  Adoption * 0.15
)

Current Score: 76/100
```

**Breakdown:**
- Consistency: 73/100 (30% weight) = 21.9 points
- Accessibility: 84/100 (35% weight) = 29.4 points
- Maintainability: 70/100 (20% weight) = 14.0 points
- Adoption: 70/100 (15% weight) = 10.5 points
- **Total: 75.8/100**

### Token Health Metrics

```json
{
  "tokenHealth": {
    "colors": {
      "defined": 18,
      "used": 18,
      "coverage": "100%",
      "duplicates": 0,
      "health": "95/100"
    },
    "spacing": {
      "defined": 9,
      "used": 9,
      "coverage": "100%",
      "gridCompliance": "100%",
      "health": "98/100"
    },
    "typography": {
      "defined": 2,
      "used": 2,
      "coverage": "100%",
      "scaleConsistency": "60%",
      "health": "70/100"
    }
  }
}
```

## Analytics Dashboard

### Key Performance Indicators (KPIs)

**Adoption KPIs:**
- ✅ Components in use: 671 available
- 📊 Token adoption rate: Track via CSS usage
- 🎯 Team adoption: Track via repository usage
- 📈 Growth rate: Monitor monthly

**Quality KPIs:**
- ♿ Accessibility: 84/100 (Target: 90/100)
- 🎨 Consistency: 73/100 (Target: 85/100)
- 🔧 Maintainability: 70/100 (Target: 80/100)
- ✅ Test Coverage: Track per component

**Performance KPIs:**
- ⚡ Bundle size impact: Monitor with each release
- 🚀 Build time: Track compilation time
- 📦 Tree-shaking efficiency: Unused code elimination

### Implementation: Analytics Dashboard

```typescript
// analytics/dashboard.tsx
import React from 'react';

export function AnalyticsDashboard() {
  const metrics = {
    totalComponents: 671,
    heroUIComponents: 526,
    shadcnComponents: 145,
    tokenCount: 29,
    healthScore: 76,
    accessibilityScore: 84,
    consistencyScore: 73,
    maintainabilityScore: 70
  };

  return (
    <div className="dashboard">
      <h1>Design System Analytics</h1>

      <section className="metrics-grid">
        <MetricCard
          title="Total Components"
          value={metrics.totalComponents}
          trend="+0%"
        />
        <MetricCard
          title="Health Score"
          value={`${metrics.healthScore}/100`}
          trend="+3%"
        />
        <MetricCard
          title="Accessibility"
          value={`${metrics.accessibilityScore}/100`}
          trend="+5%"
        />
        <MetricCard
          title="Consistency"
          value={`${metrics.consistencyScore}/100`}
          trend="+2%"
        />
      </section>

      <section className="charts">
        <ComponentDistribution data={metrics} />
        <TokenUsageChart />
        <QualityTrends />
      </section>
    </div>
  );
}
```

## Usage Patterns

### Most Used Tokens (Projected)

```
Top 10 Tokens by Usage:
1. --sp-space-4 (16px) - Standard spacing
2. --sp-colors-accent - Primary actions
3. --sp-space-3 (12px) - Compact spacing
4. --sp-space-6 (24px) - Section spacing
5. --sp-colors-fg-default - Body text
6. --sp-space-2 (8px) - Tight spacing
7. --sp-font-size - Base typography
8. --sp-colors-fg-active - Active states
9. --sp-space-5 (20px) - Comfortable spacing
10. --sp-colors-bg-active - Hover states
```

### Component Usage Patterns

```
Most Frequently Used Components (Estimated):
1. Button variants (Multiple implementations)
2. Card/Container components
3. Input fields and forms
4. Modal/Dialog components
5. Navigation components
6. Typography components
7. Icon components
8. Layout components (Grid, Flex)
9. Alert/Toast notifications
10. Dropdown/Select components
```

## Monitoring Setup

### PostCSS Plugin for Analytics

```javascript
// postcss-design-system-analytics.js
module.exports = () => {
  const tokenUsage = new Map();

  return {
    postcssPlugin: 'design-system-analytics',
    Declaration(decl) {
      const matches = decl.value.match(/var\((--sp-[^)]+)\)/g);
      if (matches) {
        matches.forEach(match => {
          const token = match.replace(/var\(|\)/g, '');
          tokenUsage.set(token, (tokenUsage.get(token) || 0) + 1);
        });
      }
    },
    OnceExit(root, { result }) {
      // Output analytics
      console.log('\nDesign System Token Usage:');
      Array.from(tokenUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([token, count]) => {
          console.log(`  ${token}: ${count} usages`);
        });
    }
  };
};

module.exports.postcss = true;
```

### GitHub Actions Analytics

```yaml
# .github/workflows/design-system-analytics.yml
name: Design System Analytics

on:
  push:
    branches: [main]
  pull_request:

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Analyze Token Usage
        run: |
          echo "Analyzing design system usage..."
          grep -r "var(--sp-" src/ | wc -l > token-usage-count.txt

      - name: Component Import Analysis
        run: |
          echo "Analyzing component imports..."
          grep -r "from '@heroui" src/ | wc -l > heroui-imports.txt
          grep -r "from 'shadcn" src/ | wc -l > shadcn-imports.txt

      - name: Generate Report
        run: |
          echo "# Design System Usage Report" > report.md
          echo "Token usages: $(cat token-usage-count.txt)" >> report.md
          echo "HeroUI imports: $(cat heroui-imports.txt)" >> report.md
          echo "shadcn imports: $(cat shadcn-imports.txt)" >> report.md

      - name: Comment PR
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

## Reporting

### Weekly Report Template

```markdown
# Design System Weekly Report

## Period: [Date Range]

### Adoption Metrics
- New components adopted: X
- Token usage increase: +X%
- Teams using design system: X/Y

### Quality Metrics
- Accessibility score: X/100 (±X)
- Consistency score: X/100 (±X)
- Test coverage: X% (±X%)

### Issues & Blockers
- [List any blockers]
- [List new feature requests]

### Highlights
- [Major achievements]
- [Upcoming changes]

### Action Items
- [ ] Item 1
- [ ] Item 2
```

### Monthly Analytics Export

```javascript
// analytics/export.js
export function generateMonthlyReport() {
  return {
    period: '2025-10',
    metrics: {
      components: {
        total: 671,
        new: 0,
        updated: 0,
        deprecated: 0
      },
      tokens: {
        total: 29,
        colors: 18,
        spacing: 9,
        typography: 2
      },
      quality: {
        health: 76,
        accessibility: 84,
        consistency: 73,
        maintainability: 70
      },
      usage: {
        totalProjects: 'TBD',
        tokenUsages: 'TBD',
        componentImports: 'TBD'
      }
    },
    recommendations: [
      'Increase typography tokens for complete type scale',
      'Improve consistency score to 85/100',
      'Add dark mode color tokens',
      'Expand animation pattern library'
    ]
  };
}
```

## Integration with Analytics Services

### Google Analytics

```javascript
// Track design system events
gtag('event', 'design_system_token_used', {
  'token_name': '--sp-colors-accent',
  'token_category': 'color',
  'page_path': window.location.pathname
});
```

### Mixpanel

```javascript
mixpanel.track('Component Rendered', {
  'component_name': 'Button',
  'component_source': 'heroui',
  'token_count': 3
});
```

### Custom Analytics

```typescript
// analytics/custom-tracker.ts
class DesignSystemAnalytics {
  private endpoint = '/api/analytics/design-system';

  trackTokenUsage(token: string, context: string) {
    fetch(this.endpoint, {
      method: 'POST',
      body: JSON.stringify({
        event: 'token_used',
        token,
        context,
        timestamp: Date.now()
      })
    });
  }

  trackComponentMount(component: string, props: any) {
    fetch(this.endpoint, {
      method: 'POST',
      body: JSON.stringify({
        event: 'component_mounted',
        component,
        propsCount: Object.keys(props).length,
        timestamp: Date.now()
      })
    });
  }
}

export const analytics = new DesignSystemAnalytics();
```

## Resources

- [Design Tokens](../design-tokens/) - Token definitions
- [Component Inventory](../components/_component-inventory.md) - All components
- [Quality Metrics](../quality/metrics-report.md) - Quality scores

---

**Last Updated**: October 2025
**Analytics Version**: 1.0
