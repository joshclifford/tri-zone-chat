

# Redesign Engine Cards — Remove Blank Space, Make Them Look Premium

## Problem

The `aspect-square` class forces cards into a 1:1 ratio, but the content only fills the top portion, leaving awkward empty space at the bottom.

## Approach

Remove `aspect-square` and let the cards size naturally to their content. Then elevate the visual design to make them feel premium:

### Layout Changes
- Remove `aspect-square` — let cards auto-height based on content
- Add `justify-between` so content spreads evenly if cards end up slightly different heights (grid will equalize them)

### Visual Upgrades
- Increase emoji size to `text-5xl` and add a subtle background circle behind it (a `w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center` wrapper)
- Bump title to `text-lg font-bold`
- Give each step its own pill/chip styling (`px-2 py-0.5 rounded-md bg-muted/50 text-xs`) with arrow separators between them — makes the flow feel more tangible
- Add a subtle gradient or ring glow on hover for the enabled card (`hover:border-primary/40 hover:shadow-md hover:shadow-primary/5`)
- Push the step flow to the bottom with `mt-auto` so all cards align their steps at the same vertical position

### Result
Cards will be compact, content-dense, and visually balanced — no wasted space. The pill-style steps and the hover glow will give them a polished, app-like feel.

## Technical Detail

| File | Change |
|------|--------|
| `src/pages/UserHome.tsx` | Remove `aspect-square`, add emoji wrapper, pill-style steps, enhanced hover effects, `mt-auto` on step row |

### Key class changes on the card:
```
// Before
"... p-6 aspect-square flex flex-col ..."

// After  
"... p-6 flex flex-col ..."
```

### Emoji wrapper:
```tsx
<div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center text-3xl mb-4">
  {engine.emoji}
</div>
```

### Step pills:
```tsx
<div className="flex items-center gap-1.5 flex-wrap mt-auto pt-4">
  {engine.steps.map((step, i) => (
    <React.Fragment key={step}>
      <span className="px-2 py-0.5 rounded-md bg-muted/50 text-[11px] text-muted-foreground">
        {step}
      </span>
      {i < engine.steps.length - 1 && (
        <span className="text-muted-foreground/40 text-xs">→</span>
      )}
    </React.Fragment>
  ))}
</div>
```

