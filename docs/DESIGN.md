---
name: Crimson Task Flow
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1dbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dfe9fa'
  surface-container-highest: '#d9e3f4'
  on-surface: '#121c28'
  on-surface-variant: '#5c403c'
  inverse-surface: '#27313e'
  inverse-on-surface: '#eaf1ff'
  outline: '#916f6b'
  outline-variant: '#e6bdb8'
  surface-tint: '#bf0715'
  primary: '#b70011'
  on-primary: '#ffffff'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#ffb4ab'
  secondary: '#b02d29'
  on-secondary: '#ffffff'
  secondary-container: '#ff665c'
  on-secondary-container: '#690007'
  tertiary: '#605758'
  on-tertiary: '#ffffff'
  tertiary-container: '#796f70'
  on-tertiary-container: '#fff5f5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ac'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#8e1214'
  tertiary-fixed: '#eddfe0'
  tertiary-fixed-dim: '#d0c3c5'
  on-tertiary-fixed: '#211a1b'
  on-tertiary-fixed-variant: '#4d4546'
  background: '#f8f9ff'
  on-background: '#121c28'
  surface-variant: '#d9e3f4'
  ruby-accent: '#BE123C'
  soft-pink: '#FFE4E6'
  border-subtle: '#E5E7EB'
  surface-muted: '#F9FAFB'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  kanban-column-width: 320px
---

## Brand & Style

This design system embodies a **Minimalist** philosophy tailored for high-stakes task management and job tracking. The brand personality is professional, decisive, and exceptionally organized, aimed at users who require a high-performance environment to manage complex workflows.

The visual narrative is built on the tension between vast amounts of whitespace and high-impact "Action Red" highlights. By stripping away unnecessary ornamentation and utilizing subtle borders instead of heavy shadows, the UI achieves a "lightweight" feel that reduces cognitive load. The emotional response is one of clarity and momentum—transforming a potentially stressful job search into a structured, manageable process.

## Colors

The palette is anchored by a sophisticated range of reds, from the energetic **Crimson** (#DC2626) used for primary actions to a deep **Ruby** (#991B1B) for secondary emphasis. Contrast is provided by **Soft Pinks** (#FFF1F2) which serve as surface tints for active states or category highlights without overwhelming the eye.

The interface defaults to **Light Mode** to maximize the perception of whitespace. Neutrals are kept in a cool, professional spectrum of grays to ensure that the red primary color remains the undisputed "North Star" for navigation and task completion. Semantic colors (Success/Go) should be used sparingly, letting the monochromatic red theme drive the brand identity.

## Typography

The typography system uses **Hanken Grotesk** for headlines to provide a sharp, contemporary edge that feels "engineered" and precise. **Inter** is utilized for body copy and UI labels due to its exceptional legibility and neutral character, ensuring that dense job descriptions and timeline notes remain highly readable.

A strict hierarchy is maintained through weight and capitalization. Kanban column headers use `label-caps` to distinguish structural elements from interactive content. Large headlines utilize negative letter-spacing for a tighter, more professional "editorial" appearance.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a specific focus on the horizontal Kanban axis for desktop and a vertical stack for mobile. A base unit of 4px governs all padding and margins to ensure mathematical harmony.

### Kanban Board Philosophy
- **Mobile:** A single-column view where users swipe or use a tab-bar to switch between stages (`TO_APPLY`, `APPLIED`, etc.).
- **Desktop:** A 5-column horizontal layout with fixed column widths of 320px. Gutters are strictly 16px to maintain a dense but breathable information flow.
- **Whitespace:** Large 32px margins on the edges of the main viewport reinforce the minimalist aesthetic, pushing content into a focused central area.

## Elevation & Depth

This system avoids heavy drop shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**. 

- **Surface Tier 1 (Background):** Pure White (#FFFFFF).
- **Surface Tier 2 (Kanban Columns):** Muted Surface (#F9FAFB) with no border.
- **Surface Tier 3 (Cards):** Pure White (#FFFFFF) with a 1px border (#E5E7EB).

To indicate elevation during "Drag and Drop" interactions, a subtle, highly-diffused ruby-tinted shadow is applied to the active card, signaling its separation from the board. Otherwise, the interface remains flat and grounded.

## Shapes

The design uses **Soft** (0.25rem) roundedness to maintain a professional and slightly rigid feel. This minimal rounding provides just enough approachability to avoid the "sharpness" of early brutalism while remaining firmly within the modern professional saas aesthetic.

- **Buttons & Inputs:** 4px (0.25rem) radius.
- **Cards:** 8px (0.5rem) radius for a slightly softer container feel.
- **Tags/Pills:** Fully rounded (Pill-shaped) to distinguish them clearly from interactive buttons and structural cards.

## Components

### Buttons
- **Primary:** Crimson background, white text. No shadow, 1px inset border of a darker ruby shade on hover.
- **Secondary:** Soft Pink background with Crimson text. For low-priority actions.
- **Ghost:** No background, subtle gray border, red text on hover.

### Kanban Cards
Cards are the primary data container. They feature a 1px `border-subtle`, a white background, and a "Status Indicator" strip (2px wide) on the left edge using the primary action color.

### Inputs & Form Fields
Fields use a 1px border that turns Crimson on focus. Labels are always positioned above the input in `label-caps` to ensure clarity during manual data entry.

### Timeline
A vertical line (1px, #E5E7EB) connects circular nodes. System-generated events use a gray node; user-generated notes use a Crimson node to highlight human interaction.

### Chips & Tags
Tags for "Remote" or "Salary" use the `caption` type style. They have a very light gray background and no border to keep them secondary to the card title.