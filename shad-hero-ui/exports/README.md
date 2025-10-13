# Export Utilities

## Overview

Tools and scripts for exporting design tokens to various formats and platforms.

## Available Exports

### 1. Figma Export

Export design tokens to Figma-compatible JSON format.

**File**: `figma-tokens.json`

```json
{
  "colors": {
    "accent": {
      "value": "#7828c8",
      "type": "color"
    },
    "foreground": {
      "active": {
        "value": "#F4F4F4",
        "type": "color"
      },
      "default": {
        "value": "#757678",
        "type": "color"
      }
    }
  },
  "spacing": {
    "1": {
      "value": "4px",
      "type": "spacing"
    },
    "2": {
      "value": "8px",
      "type": "spacing"
    }
  }
}
```

### 2. Tailwind CSS Export

Convert design tokens to Tailwind CSS configuration.

**File**: `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        accent: '#7828c8',
        foreground: {
          active: '#F4F4F4',
          default: '#757678',
        },
        background: {
          active: '#A258DF2b',
        },
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
      },
      fontSize: {
        base: '14px',
      },
    },
  },
};
```

### 3. Style Dictionary Export

Export in Style Dictionary format for multi-platform use.

**File**: `tokens.json` (Style Dictionary format)

```json
{
  "color": {
    "accent": {
      "value": "#7828c8"
    },
    "foreground": {
      "active": {
        "value": "#F4F4F4"
      },
      "default": {
        "value": "#757678"
      }
    }
  },
  "size": {
    "spacing": {
      "1": { "value": "4" },
      "2": { "value": "8" },
      "3": { "value": "12" },
      "4": { "value": "16" },
      "5": { "value": "20" },
      "6": { "value": "24" },
      "7": { "value": "28" },
      "8": { "value": "32" }
    },
    "font": {
      "base": { "value": "14" }
    }
  }
}
```

### 4. iOS Export

Export to Swift constants for iOS development.

**File**: `DesignTokens.swift`

```swift
import UIKit

struct DesignTokens {
    struct Colors {
        static let accent = UIColor(hex: "#7828c8")
        static let foregroundActive = UIColor(hex: "#F4F4F4")
        static let foregroundDefault = UIColor(hex: "#757678")
        static let backgroundActive = UIColor(hex: "#A258DF2b")
    }

    struct Spacing {
        static let space1: CGFloat = 4
        static let space2: CGFloat = 8
        static let space3: CGFloat = 12
        static let space4: CGFloat = 16
        static let space5: CGFloat = 20
        static let space6: CGFloat = 24
        static let space7: CGFloat = 28
        static let space8: CGFloat = 32
    }

    struct Typography {
        static let baseFontSize: CGFloat = 14
    }
}

extension UIColor {
    convenience init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            red: CGFloat(r) / 255,
            green: CGFloat(g) / 255,
            blue: CGFloat(b) / 255,
            alpha: CGFloat(a) / 255
        )
    }
}
```

### 5. Android Export

Export to XML resources for Android development.

**File**: `colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="accent">#7828c8</color>
    <color name="foreground_active">#F4F4F4</color>
    <color name="foreground_default">#757678</color>
    <color name="background_active">#A258DF2b</color>
</resources>
```

**File**: `dimens.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <dimen name="spacing_1">4dp</dimen>
    <dimen name="spacing_2">8dp</dimen>
    <dimen name="spacing_3">12dp</dimen>
    <dimen name="spacing_4">16dp</dimen>
    <dimen name="spacing_5">20dp</dimen>
    <dimen name="spacing_6">24dp</dimen>
    <dimen name="spacing_7">28dp</dimen>
    <dimen name="spacing_8">32dp</dimen>

    <dimen name="font_size_base">14sp</dimen>
</resources>
```

### 6. Flutter Export

Export to Dart constants for Flutter development.

**File**: `design_tokens.dart`

```dart
import 'package:flutter/material.dart';

class DesignTokens {
  // Colors
  static const Color accent = Color(0xFF7828c8);
  static const Color foregroundActive = Color(0xFFF4F4F4);
  static const Color foregroundDefault = Color(0xFF757678);
  static const Color backgroundActive = Color(0x2bA258DF);

  // Spacing
  static const double space1 = 4.0;
  static const double space2 = 8.0;
  static const double space3 = 12.0;
  static const double space4 = 16.0;
  static const double space5 = 20.0;
  static const double space6 = 24.0;
  static const double space7 = 28.0;
  static const double space8 = 32.0;

  // Typography
  static const double baseFontSize = 14.0;
}
```

### 7. React Native Export

Export to React Native StyleSheet.

**File**: `tokens.ts`

```typescript
import { Platform } from 'react-native';

export const tokens = {
  colors: {
    accent: '#7828c8',
    foregroundActive: '#F4F4F4',
    foregroundDefault: '#757678',
    backgroundActive: '#A258DF2b',
  },

  spacing: {
    space1: 4,
    space2: 8,
    space3: 12,
    space4: 16,
    space5: 20,
    space6: 24,
    space7: 28,
    space8: 32,
  },

  typography: {
    baseFontSize: 14,
  },
} as const;

export type TokensType = typeof tokens;
```

## Export Scripts

### Node.js Export Script

**File**: `export-tokens.js`

```javascript
const fs = require('fs');
const path = require('path');

// Load tokens
const tokens = JSON.parse(
  fs.readFileSync('../design-tokens/tokens.json', 'utf8')
);

// Export to Tailwind
function exportToTailwind(tokens) {
  const config = {
    theme: {
      extend: {
        colors: {},
        spacing: {},
        fontSize: {},
      },
    },
  };

  // Convert colors
  tokens.colors.forEach(color => {
    const name = color.name.replace('--sp-colors-', '').replace(/-/g, '_');
    config.theme.extend.colors[name] = color.value;
  });

  // Convert spacing
  tokens.spacing.forEach(space => {
    const name = space.name.replace('--sp-space-', '');
    config.theme.extend.spacing[name] = space.value;
  });

  // Convert typography
  tokens.typography.forEach(typo => {
    const name = typo.name.replace('--sp-', '').replace(/-/g, '_');
    config.theme.extend.fontSize[name] = typo.font_size;
  });

  fs.writeFileSync(
    'tailwind.config.js',
    `module.exports = ${JSON.stringify(config, null, 2)}`
  );
}

// Export to Figma
function exportToFigma(tokens) {
  const figmaTokens = {
    colors: {},
    spacing: {},
    typography: {},
  };

  tokens.colors.forEach(color => {
    const name = color.name.replace('--sp-colors-', '');
    figmaTokens.colors[name] = {
      value: color.value,
      type: 'color',
    };
  });

  tokens.spacing.forEach(space => {
    const name = space.name.replace('--sp-space-', '');
    figmaTokens.spacing[name] = {
      value: space.value,
      type: 'spacing',
    };
  });

  fs.writeFileSync(
    'figma-tokens.json',
    JSON.stringify(figmaTokens, null, 2)
  );
}

// Export to iOS
function exportToiOS(tokens) {
  let swift = `import UIKit\n\nstruct DesignTokens {\n`;

  // Colors
  swift += `    struct Colors {\n`;
  tokens.colors.forEach(color => {
    const name = color.name
      .replace('--sp-colors-', '')
      .split('-')
      .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    swift += `        static let ${name} = UIColor(hex: "${color.value}")\n`;
  });
  swift += `    }\n\n`;

  // Spacing
  swift += `    struct Spacing {\n`;
  tokens.spacing.forEach(space => {
    const name = space.name.replace('--sp-space-', 'space');
    const value = space.value.replace('px', '');
    swift += `        static let ${name}: CGFloat = ${value}\n`;
  });
  swift += `    }\n`;

  swift += `}\n`;

  fs.writeFileSync('DesignTokens.swift', swift);
}

// Run exports
console.log('Exporting design tokens...');
exportToTailwind(tokens);
exportToFigma(tokens);
exportToiOS(tokens);
console.log('✓ Export complete!');
```

### Python Export Script

**File**: `export_tokens.py`

```python
import json
from pathlib import Path

def load_tokens():
    with open('../design-tokens/tokens.json', 'r') as f:
        return json.load(f)

def export_to_android(tokens):
    """Export to Android XML resources"""

    # Colors
    colors_xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
    for color in tokens['colors']:
        name = color['name'].replace('--sp-colors-', '').replace('-', '_')
        colors_xml += f'    <color name="{name}">{color["value"]}</color>\n'
    colors_xml += '</resources>\n'

    Path('colors.xml').write_text(colors_xml)

    # Dimensions
    dimens_xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
    for space in tokens['spacing']:
        name = space['name'].replace('--sp-space-', 'spacing_')
        value = space['value'].replace('px', 'dp')
        dimens_xml += f'    <dimen name="{name}">{value}</dimen>\n'
    dimens_xml += '</resources>\n'

    Path('dimens.xml').write_text(dimens_xml)

def export_to_flutter(tokens):
    """Export to Flutter Dart"""

    dart = 'import \'package:flutter/material.dart\';\n\n'
    dart += 'class DesignTokens {\n'

    # Colors
    dart += '  // Colors\n'
    for color in tokens['colors']:
        name = color['name'].replace('--sp-colors-', '')
        name = ''.join(word.capitalize() for word in name.split('-'))
        name = name[0].lower() + name[1:]

        hex_value = color['value'].replace('#', '0xFF')
        dart += f'  static const Color {name} = Color({hex_value});\n'

    # Spacing
    dart += '\n  // Spacing\n'
    for space in tokens['spacing']:
        name = space['name'].replace('--sp-space-', 'space')
        value = space['value'].replace('px', '')
        dart += f'  static const double {name} = {value}.0;\n'

    dart += '}\n'

    Path('design_tokens.dart').write_text(dart)

if __name__ == '__main__':
    print('Exporting design tokens...')
    tokens = load_tokens()
    export_to_android(tokens)
    export_to_flutter(tokens)
    print('✓ Export complete!')
```

## Usage

### Export All Formats

```bash
# Node.js exports
node export-tokens.js

# Python exports
python3 export_tokens.py
```

### Export Specific Platform

```bash
# Export to Tailwind only
node -e "require('./export-tokens.js').exportToTailwind()"

# Export to iOS only
node -e "require('./export-tokens.js').exportToiOS()"
```

## Custom Export Template

Create your own export format:

```javascript
// custom-export.js
function exportToCustomFormat(tokens) {
  const output = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tokens: {
      // Your custom format here
    },
  };

  fs.writeFileSync(
    'custom-tokens.json',
    JSON.stringify(output, null, 2)
  );
}
```

## Automation

### GitHub Actions

```yaml
# .github/workflows/export-tokens.yml
name: Export Design Tokens

on:
  push:
    paths:
      - 'shad-hero-ui/design-tokens/**'

jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Export tokens
        run: |
          cd shad-hero-ui/exports
          node export-tokens.js

      - name: Commit exports
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add shad-hero-ui/exports/*
          git commit -m "Update exported tokens" || exit 0
          git push
```

## Resources

- [Design Tokens](../design-tokens/) - Source tokens
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Token transformation tool
- [Figma Tokens](https://www.figma.com/community/plugin/888356646278934516) - Figma plugin

---

**Last Updated**: October 2025
**Export Formats**: 7+ platforms supported
