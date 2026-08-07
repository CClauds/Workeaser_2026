---
name: Workeaser Operator
colors:
  surface: '#FFFFFF'
  surface-dim: '#d6dadf'
  surface-bright: '#f5faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f9'
  surface-container: '#eaeef3'
  surface-container-high: '#e4e9ee'
  surface-container-highest: '#dee3e8'
  on-surface: '#171c20'
  on-surface-variant: '#3e484f'
  inverse-surface: '#2c3135'
  inverse-on-surface: '#edf1f6'
  outline: '#6e7880'
  outline-variant: '#bdc8d1'
  surface-tint: '#00A2DD'
  primary: '#00A2DD'
  on-primary: '#ffffff'
  primary-container: '#00A2DD'
  on-primary-container: '#00344a'
  inverse-primary: '#80d0ff'
  secondary: '#2B3450'
  on-secondary: '#ffffff'
  secondary-container: '#d0d9fd'
  on-secondary-container: '#555e7c'
  tertiary: '#8d4f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#da8320'
  on-tertiary-container: '#4b2700'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5e7ff'
  primary-fixed-dim: '#80d0ff'
  on-primary-fixed: '#001e2d'
  on-primary-fixed-variant: '#004c6a'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#bdc5e8'
  on-secondary-fixed: '#111a35'
  on-secondary-fixed-variant: '#3d4663'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#ffb875'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6b3b00'
  background: '#F8FAFC'
  on-background: '#171c20'
  surface-variant: '#dee3e8'
  border: '#E2E8F0'
  success: '#10B981'
  warning: '#F59E0B'
  info: '#3B82F6'
typography:
  headline-lg:
    fontFamily: Laca
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Laca
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Laca
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Laca
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Laca
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-grid: 8px
  gutter: 24px
  sidebar-width: 240px
  sidebar-collapsed: 64px
  container-padding: 24px
---

# DESIGN.md — Workeaser Management Panel (Rebuild)

## Product
Workeaser is a coworking management platform. This system defines the **Management Panel (Operator App)**, a high-density operational tool for staff.

## Design Principles
- **Clarity for Beginners:** Plain labels, no jargon, obvious primary actions.
- **Action-First:** Dashboard and lists prioritize pending items and needed actions.
- **Ordered Density:** Dense information without clutter, using an 8px spacing grid.
- **Safety:** Confirmation dialogs for destructive actions; clear separation between Daily Use and Setup.

## Color Palette
| Token | Hex | Use |
|---|---|---|
| Primary | `#00A2DD` | Main actions, active states, key data highlights |
| Secondary / Navy | `#2B3450` | Sidebar, table headers, primary text, structural borders |
| Background | `#F8FAFC` | Main application background |
| Surface | `#FFFFFF` | Cards, table rows, modal surfaces |
| Border | `#E2E8F0` | Dividers and element outlines |
| Success | `#10B981` | Paid, Signed, Completed states |
| Warning | `#F59E0B` | Pending items, almost due |
| Error | `#EF4444` | Overdue, deleted, errors |
| Info | `#3B82F6` | General notifications, system messages |

## Typography
- **Laca:** Primary typeface for all headings and UI text.
- **Scale:** Max 3 typographic levels for simplicity.
- **Alignment:** Clean, left-aligned data in tables.

## Components
- **Sidebar:** Navy (#2B3450) background, persistent, collapsible. Collapsed shows icons only. Grouped into "Daily Use" and "Setup".
- **Cards:** White surface, 1px border (#E2E8F0), 8px corner radius, no shadows.
- **Tables:** Navy header row with white text. Alternating row highlights. Clickable rows.
- **Buttons:**
  - Primary: Cyan (#00A2DD) background, white text.
  - Secondary: White background, 1px Navy border, Navy text.
  - Ghost: Transparent, Navy text.
- **Status Badges:** Small, rounded-full, low-saturation background with high-saturation text of semantic color.
- **Form Inputs:** 1px border, 8px radius, clear labels above the field.

## Layout
- Left Sidebar (~240px).
- Top Global Bar: Centered search, right-aligned notifications and profile.
- Content area: 24px gutter, 8px grid spacing.
