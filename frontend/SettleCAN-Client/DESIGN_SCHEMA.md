# SettleCAN Design Schema — Branding & UI Standards

## 🎨 Brand Colors
SettleCAN uses a warm, authoritative palette inspired by Canadian identity and government service design. These colors are defined in SCSS variables for consistent use across the app.

| Purpose | Color | Hex |
|---|---|---|
| Primary Brand Color | Deep Red | `#8E0002` |
| Text (Dark) | Charcoal | `#333333` |
| Light Background | Soft Gray | `#F5F5F5` |
| Max Layout Width | — | `1200px` |

### SCSS Reference
```scss
$primary: #8E0002;
$text-dark: #333;
$light-bg: #f5f5f5;
$max-width: 1200px;
```

## ✍️ Typography
SettleCAN uses clean, modern, accessible typography optimized for readability across devices.

- **Primary Font:** Inter
- **Type style:** Sans‑serif, highly legible
- Works well for UI, forms, and long text

### Font Weights
- `400` — Regular body text
- `500` — Navigation, labels
- `600` — Buttons, section titles
- `700` — Page titles, hero headings

### Font Sizes
| Element | Size |
|---|---|
| Hero Title | `3rem` |
| Section Title | `2.2rem` |
| Body Text | `1.1–1.2rem` |
| Navbar Text | `1rem` |
| Buttons | `1rem` |

## 🧱 Layout & Spacing
SettleCAN uses a clean, breathable layout with consistent spacing.

- **Grid & Width**
  - Max width: `1200px`
  - Padding: `2rem` standard
  - Section spacing: `4–6rem` vertical

### Breakpoints
| Device | Width |
|---|---|
| Mobile | `< 600px` |
| Tablet | `600–900px` |
| Desktop | `900–1200px` |
| Large Desktop | `> 1200px` |

## 🔲 Buttons
### Primary Button
- Background: `$primary`
- Text: white
- Radius: `6px`
- Weight: `600`
- Hover: darken primary by ~8%

### Secondary Button
- Background: white
- Border: `1px solid $text-dark`
- Text: `$text-dark`
- Hover: light gray background

## 🧭 Navigation Bar
- Background: white
- Shadow: subtle `0 2px 6px rgba(0,0,0,0.08)`
- Logo left, links center, auth buttons right
- Link hover color: `$primary`

## 🟥 Hero Section
- Background: `$primary`
- Text: white
- Alignment: left
- Padding: `6–8rem`
- Buttons: light + outline styles

## 🖼️ Imagery Style
SettleCAN uses imagery that reflects:
- Diversity
- Newcomer experiences
- Canadian landscapes
- Support, guidance, and community

Images should feel:
- Warm
- Trustworthy
- Human‑centered
- Clean and modern

## 🧩 Component Style Rules
### Cards
- Light background (`#f9f9f9` or `$light-bg`)
- Rounded corners (`10px`)
- Soft shadow
- `1.2rem` spacing inside

### Sections
- Alternating white and light-gray backgrounds
- Clear section titles
- Max-width centered content

## 🧱 SCSS Structure
```
scss/
  _variables.scss
  TopNavbar.scss
  Hero.scss
  AboutPage.scss
  Features.scss
  News.scss
  Footer.scss
```

All SCSS files import variables using:

```scss
@use "./variables" as *;
```
