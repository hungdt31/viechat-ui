# Component Specs (Ant Design Based)

All dimensions in pixels. Colors reference `design-tokens.md`.

## Button

### Primary Button
```javascript
{
  height: 40,
  paddingLeft: 16, paddingRight: 16,
  cornerRadius: 10,
  fillColor: { r: 0.15, g: 0.39, b: 0.92 },  // Primary
  layoutMode: "HORIZONTAL",
  counterAxisAlignItems: "CENTER",
  primaryAxisAlignItems: "CENTER"
}
// Text: fontSize 14, fontWeight 500, color white
```

### Secondary Button
```javascript
{
  height: 40,
  paddingLeft: 16, paddingRight: 16,
  cornerRadius: 10,
  fillColor: null,  // transparent
  strokeColor: { r: 0.89, g: 0.91, b: 0.94 },  // Border
  strokeWeight: 1
}
// Text: fontSize 14, fontWeight 500, color Text Dark
```

### Size Variants
- **Small**: height 32, paddingX 12, fontSize 13, radius 8
- **Large**: height 48, paddingX 20, fontSize 15, radius 12

## Badge / Tag

### Status Badge
```javascript
{
  paddingLeft: 8, paddingRight: 8,
  paddingTop: 2, paddingBottom: 2,
  cornerRadius: 4,
  fillColor: { /* status-specific */ },
  strokeColor: { /* status-specific, 20% opacity */ },
  strokeWeight: 1,
  layoutMode: "HORIZONTAL",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG"
}
// Text: fontSize 12, fontWeight 600, color status-specific
```

## Input

### Text Input
```javascript
{
  height: 40,
  paddingLeft: 12, paddingRight: 12,
  cornerRadius: 10,
  fillColor: { r: 1, g: 1, b: 1 },  // BG Card
  strokeColor: { r: 0.89, g: 0.91, b: 0.94 },  // Border
  strokeWeight: 1,
  layoutMode: "HORIZONTAL",
  counterAxisAlignItems: "CENTER"
}
// Text: fontSize 14, color Text Dark
// Placeholder: fontSize 14, color Text Light
```

### Search Input
```javascript
{
  height: 40,
  paddingLeft: 12, paddingRight: 12,
  cornerRadius: 10,
  fillColor: { r: 0.98, g: 0.98, b: 0.99 },  // BG Header
  strokeColor: null
}
// Prefix: Search icon, 16px, Text Gray
```

## Card

### Base Card
```javascript
{
  cornerRadius: 16,
  paddingTop: 20, paddingBottom: 20,
  paddingLeft: 20, paddingRight: 20,
  fillColor: { r: 1, g: 1, b: 1 },  // BG Card
  strokeColor: { r: 0.95, g: 0.96, b: 0.98 },  // Border Light
  strokeWeight: 1,
  layoutMode: "VERTICAL",
  itemSpacing: 16
}
```

### Card Header
```javascript
{
  layoutMode: "HORIZONTAL",
  itemSpacing: 12,
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "FILL"
}
// Title: H3 (fontSize 16, fontWeight 600)
// Icon: 20x20
```

## KPI Card

```javascript
{
  width: 280, height: 120,
  cornerRadius: 16,
  paddingTop: 20, paddingBottom: 20,
  paddingLeft: 20, paddingRight: 20,
  fillColor: { /* gradient background */ },
  layoutMode: "VERTICAL",
  itemSpacing: 8
}
// Icon Container: 40x40, cornerRadius 10
// Value: KPI Large (fontSize 32, fontWeight 700)
// Label: Caption (fontSize 12, fontWeight 500, Text Gray)
// Trend: Small (fontSize 11, Success/Error color)
```

## Table

### Table Container
```javascript
{
  cornerRadius: 12,
  fillColor: { r: 1, g: 1, b: 1 },
  strokeColor: { r: 0.95, g: 0.96, b: 0.98 },
  strokeWeight: 1,
  layoutMode: "VERTICAL",
  paddingTop: 0, paddingBottom: 0,
  paddingLeft: 0, paddingRight: 0,
  itemSpacing: 0
}
```

### Table Header Row
```javascript
{
  height: 48,
  fillColor: { r: 0.98, g: 0.98, b: 0.99 },  // BG Header
  layoutMode: "HORIZONTAL",
  paddingLeft: 16, paddingRight: 16,
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "FILL"
}
// Text: Label (fontSize 13, fontWeight 600, Text Gray)
```

### Table Body Row
```javascript
{
  height: 52,
  fillColor: { r: 1, g: 1, b: 1 },
  layoutMode: "HORIZONTAL",
  paddingLeft: 16, paddingRight: 16,
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "FILL"
}
// Add strokeBottom: Border Light for dividers
// Text: Body (fontSize 14, fontWeight 400, Text Dark)
```

### Column Widths (Example)
| Column Type | Width |
|-------------|-------|
| Checkbox | 48 |
| ID | 120 |
| Type Badge | 100 |
| Status Badge | 130 |
| Name | 200 |
| Info | 180 |
| Count | 60 |
| Date | 100 |
| Actions | 130 |

**IMPORTANT:** Each cell MUST be a frame with FIXED width matching header.

## Modal

### Modal Overlay
```javascript
{
  fillColor: { r: 0, g: 0, b: 0, a: 0.45 }
}
```

### Modal Container
```javascript
{
  width: 520,
  cornerRadius: 20,
  paddingTop: 24, paddingBottom: 24,
  paddingLeft: 24, paddingRight: 24,
  fillColor: { r: 1, g: 1, b: 1 },
  layoutMode: "VERTICAL",
  itemSpacing: 0
}
```

### Modal Header
```javascript
{
  height: 56,
  paddingBottom: 16,
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "SPACE_BETWEEN",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "FILL"
}
// Add strokeBottom: Border Light
// Title: H2 (fontSize 18, fontWeight 600)
// Close: 24x24 icon
```

### Modal Footer
```javascript
{
  height: 64,
  paddingTop: 16,
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MAX",  // align right
  counterAxisAlignItems: "CENTER",
  itemSpacing: 12,
  layoutSizingHorizontal: "FILL"
}
```

## Sidebar

### Sidebar Container
```javascript
{
  width: 280,
  fillColor: { r: 0.06, g: 0.09, b: 0.16 },  // BG Sidebar
  layoutMode: "VERTICAL",
  layoutSizingVertical: "FILL"
}
```

### Logo Area
```javascript
{
  height: 64,
  paddingLeft: 20, paddingRight: 20,
  fillColor: { r: 0.15, g: 0.39, b: 0.92 },  // Primary
  layoutMode: "HORIZONTAL",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "FILL"
}
// Text: fontSize 18, fontWeight 700, white
```

### Menu Item
```javascript
{
  height: 44,
  paddingLeft: 16, paddingRight: 16,
  cornerRadius: 10,
  fillColor: null,  // transparent
  layoutMode: "HORIZONTAL",
  itemSpacing: 12,
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "FILL"
}
// Icon: 20x20, color (0.80, 0.82, 0.85)
// Text: fontSize 14, color (0.80, 0.82, 0.85)
```

### Menu Item Active
```javascript
{
  fillColor: { r: 0.15, g: 0.39, b: 0.92, a: 0.9 }
}
// Icon & Text: white
```

## Header

```javascript
{
  height: 64,
  paddingLeft: 24, paddingRight: 24,
  fillColor: { r: 1, g: 1, b: 1, a: 0.85 },
  strokeColor: { r: 0.95, g: 0.96, b: 0.98 },
  strokeWeight: 1,  // bottom only
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "SPACE_BETWEEN",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "FILL"
}
```

### Breadcrumb
- fontSize 14, color Text Gray
- Separator: "/"
- Active (last): Text Dark

### User Avatar
```javascript
{
  width: 32, height: 32,
  cornerRadius: 16,
  fillColor: { r: 0.15, g: 0.39, b: 0.92 }
}
```

## Screen Frame

### Desktop 1440x900
```javascript
{
  name: "/route - Desktop",
  width: 1440, height: 900,
  fillColor: { r: 0.97, g: 0.98, b: 0.99 }  // BG Page
}
```

### Layout Structure
```
Screen (1440x900)
├── Sidebar (280 x FILL)
└── Main (FILL x FILL)
    ├── Header (FILL x 64)
    └── Content (FILL x FILL, padding 24)
```
