---
name: Velora Luxury
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#d0cecd'
  on-tertiary: '#313030'
  tertiary-container: '#b5b2b2'
  on-tertiary-container: '#464545'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c9c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 80px
    fontWeight: '700'
    lineHeight: 90px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.2em
spacing:
  unit: 8px
  container-max-width: 1440px
  gutter: 32px
  margin-desktop: 80px
  margin-tablet: 40px
  margin-mobile: 20px
---

## Brand & Style

The design system is anchored in the concept of "Dark Opulence." It evokes the atmosphere of a high-end boutique at midnight—mysterious, exclusive, and profoundly sensory. The target audience consists of discerning connoisseurs who value heritage and craftsmanship. 

The visual style is **High-End Editorial Minimalism**. It borrows the spaciousness and typographic rigor of luxury fashion magazines, utilizing large-scale imagery and extreme whitespace to let product photography breathe. The aesthetic is defined by sharp lines, metallic accents, and a strict dark-mode-first approach that emphasizes the luminosity of the perfumes themselves.

## Colors

The palette is a study in shadow and light. 

- **Obsidian (#0A0A0A):** The foundation. Used for primary backgrounds to create infinite depth.
- **Charcoal (#1A1A1A):** Used for elevated surfaces, containers, and card backgrounds to provide subtle separation from the base.
- **Metallic Gold (#D4AF37):** The signature accent. Reserved for critical touchpoints, borders, and interactive states to represent prestige.
- **Silk White (#F5F5F5):** The primary typographic color, providing high contrast and legibility against the dark void.

Use gold sparingly; it should feel like a rare thread rather than a flood. Surfaces should feel heavy and solid.

## Typography

This design system utilizes a high-contrast typographic pairing to establish authority and modernism.

- **Bodoni Moda** is the primary serif for all display and headline roles. Its dramatic vertical stress and hair-line serifs embody classic luxury. It should be used with generous leading.
- **Montserrat** serves as the functional workhorse. Its geometric structure provides a clean, contemporary counterpoint to the serif. 
- **Labeling:** All small labels and navigational elements should use Montserrat in All-Caps with expanded letter-spacing (20%) to mimic the branding found on perfume bottle etchings.

## Layout & Spacing

The layout philosophy is a **Fixed Grid** model that centers content to create a focused, gallery-like experience. 

- **Desktop:** A 12-column grid with a wide 80px outer margin. Gutters are kept wide (32px) to prevent elements from feeling crowded.
- **Rhythm:** We use an 8px base unit, but layouts should lean toward "macro-spacing"—using large gaps (64px, 80px, 120px) between sections to signify premium quality.
- **Asymmetry:** Occasionally break the grid with images that bleed to the edge of the screen to create an editorial, unconventional feel.

## Elevation & Depth

In a dark, obsidian environment, depth is achieved through **Tonal Layering** and **Gold Outlines** rather than heavy shadows.

- **Surface Tiers:** The base level is #0A0A0A. Secondary containers (cards, modals) use #1A1A1A. 
- **Subtle Glow:** Instead of traditional drop shadows, use a very faint, large-radius outer glow in #D4AF37 (opacity 5-10%) for active states or featured product cards to simulate light reflecting off glass.
- **Borders:** Use 1px solid borders in Gold (#D4AF37) for primary elements. For secondary elements, use Charcoal (#2A2A2A) to maintain a "stealth" appearance.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Luxury in this context is defined by architectural precision. All buttons, image containers, input fields, and cards must feature crisp 90-degree corners. This evokes the silhouette of a classic perfume bottle and conveys a sense of stability and timelessness. The only exception is the perfume bottles themselves in photography, which provide the organic contrast to the rigid UI.

## Components

- **Buttons:** Primary buttons are obsidian-filled with a 1px gold border and gold text. Hover states invert the colors. Use Montserrat in All-Caps for button labels.
- **Input Fields:** Minimalist "Line" style. Only a bottom border is visible (1px Charcoal), which turns Gold on focus. Labels sit above the line in small caps.
- **Cards:** Product cards use the charcoal background (#1A1A1A) with no border until hovered, at which point a thin gold border appears to "frame" the product.
- **Chips/Tags:** Small, sharp-edged boxes with gold outlines and minimal padding.
- **Scrollbar:** Custom-styled to be ultra-thin and gold, disappearing when not in use.
- **Dividers:** Use 1px gold lines, but often shortened (e.g., 40px width) and centered to separate sections without cluttering the view.