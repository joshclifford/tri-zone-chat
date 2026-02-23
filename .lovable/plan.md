

# Redesign Skill Cards and Add Million Dollar Message Steps

## Overview

Redesign the skill cards on the home page to match the reference image style (larger, more spacious, with big emoji and clean step indicators). For the "Million Dollar Message" skill specifically, show its structured interview fields (Avatar, Currency, Metric, Timeline, Obstacles, Mechanism) as numbered steps on the card.

## Visual Changes

The current cards are basic shadcn Card components. The new design will match the reference:
- Larger card with more padding (p-6)
- Emoji rendered at ~40px size with spacing below
- Bold title (text-base font-semibold)
- Description text with comfortable line height
- Numbered step pills at the bottom (matching the DiscoveryGrid workflow card style)
- Subtle hover border effect (hover:border-primary/30)
- 2-column grid layout on desktop

## Data Model

Since skills come from the database and don't have a "steps" field, we'll add a client-side mapping for known skills. This avoids a database migration for what is purely a display concern.

```typescript
const SKILL_STEPS: Record<string, string[]> = {
  "Million Dollar Message": ["Avatar", "Currency", "Metric", "Timeline", "Obstacles", "Mechanism"],
};
```

This maps skill names to their step labels. Unknown skills simply won't show steps.

## Technical Detail

### `src/pages/UserHome.tsx`
- Replace the shadcn `Card` with a custom styled `div` or `motion.div`
- Increase padding to `p-6`, emoji size to `text-4xl`
- Add the step pills row at the bottom (numbered circles + labels + arrow separators)
- Add the `SKILL_STEPS` mapping for known skills
- Apply framer-motion staggered entrance animation (matching WorkflowCard pattern)
- Grid changes to `grid-cols-1 sm:grid-cols-2 gap-4` for the 2-column reference layout

### Card Layout (per card)
```text
+----------------------------------+
|                                  |
|  [emoji 40px]                    |
|                                  |
|  Skill Name (bold)               |
|  Description text (muted,        |
|  multi-line)                     |
|                                  |
|  1 Avatar > 2 Currency > ...     |
+----------------------------------+
```

### Step Pills Rendering
Reuse the same visual pattern from `WorkflowCard.tsx`:
- Small numbered circle (w-4 h-4 rounded-full bg-muted)
- Step label text (text-[11px] text-muted-foreground)
- Arrow separator between steps
- Wrap on multiple lines for skills with many steps (like Million Dollar Message with 6 steps)

| File | Action |
|------|--------|
| `src/pages/UserHome.tsx` | Update -- redesign cards, add step mapping, staggered animation |
