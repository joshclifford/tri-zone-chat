

# Add Hero Headline and Optimize Vertical Spacing

## Changes

### `src/pages/UserHome.tsx`

- Add a large, centered headline above the card grid: **"What Are We Building Today?"**
- Style it like an above-the-fold landing page hero:
  - `text-4xl sm:text-5xl font-bold text-center text-foreground`
  - Generous top padding (`pt-24 sm:pt-32`) to push it into the visual center of the viewport
  - Bottom margin (`mb-12 sm:mb-16`) to give breathing room before the cards
- Wrap headline in a `motion.h1` with a fade-up entrance animation (appears before the cards stagger in)
- Keep the card grid as-is, just benefiting from the improved vertical rhythm

### Visual Result

```text
+------------------------------------------+
|                                          |
|          (generous whitespace)           |
|                                          |
|     What Are We Building Today?          |
|         (large, bold, centered)          |
|                                          |
|          (breathing room)                |
|                                          |
|   [Offer Engine] [Content] [Traffic]     |
|                                          |
+------------------------------------------+
```

### Technical Detail

| File | Change |
|------|--------|
| `src/pages/UserHome.tsx` | Add `motion.h1` headline above the grid, increase top padding, add spacing between headline and cards |

