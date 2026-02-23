

# Redesign Home Page — Three Engine Cards

## Overview

Remove the "Skills" heading and the database-driven skill cards. Replace with three hardcoded, visually polished engine cards. Only "Offer Engine" will be clickable and will navigate to the Million Dollar Message flow. The other two ("Content Engine" and "Traffic Engine") will be displayed but disabled.

## Cards

1. **Offer Engine** — Foundation/Strategy
   - Steps: Message, Roadmap, Model
   - Clickable — navigates to `/chat/{million-dollar-message-skill-id}`
   - Emoji: something like a diamond or target

2. **Content Engine** — Execution
   - Steps: Lead Magnet, Workshop, Nurture Sequence
   - Disabled with a "Coming Soon" or "V2" badge
   - Emoji: something like a pen or document

3. **Traffic Engine** — Distribution
   - Steps: Social, Paid Ads, Email
   - Disabled with a "Coming Soon" or "V2" badge
   - Emoji: something like a rocket or megaphone

## Technical Detail

### `src/pages/UserHome.tsx`

- Remove the `useQuery` call to fetch skills from the database — this page becomes fully static
- Remove the `SKILL_STEPS` mapping (no longer needed)
- Remove the "Skills" `h1` heading
- Define a hardcoded array of engine objects with: emoji, title, subtitle, description, steps, enabled flag
- Render three `motion.button` cards in a single-column layout (max-w-2xl, stacked vertically for a premium feel, or keep 2-col grid)
- Disabled cards get `opacity-50 cursor-not-allowed` and a "V2" badge in the top-right corner (same pattern as `WorkflowCard.tsx`)
- The Offer Engine card `onClick` navigates to `/chat/{skill-id}` — we'll fetch the skill ID at render time with a lightweight query, or hardcode the known ID (`22ad8c83-10d8-4394-960d-4867916ac1f2`)
- Remove `@tanstack/react-query` and `supabase` imports since they are no longer needed on this page

### Card Visual Style

Each card keeps the current polished style:
- `p-6` padding, large emoji, bold title, muted subtitle/description
- Numbered step pills at the bottom with arrow separators
- Hover border effect on enabled cards
- Staggered entrance animation via framer-motion

### Data Structure

```typescript
const ENGINES = [
  {
    emoji: "💎",
    title: "Offer Engine",
    subtitle: "Foundation / Strategy",
    steps: ["Message", "Roadmap", "Model"],
    enabled: true,
  },
  {
    emoji: "✏️",
    title: "Content Engine",
    subtitle: "Execution",
    steps: ["Lead Magnet", "Workshop", "Nurture Sequence"],
    enabled: false,
  },
  {
    emoji: "🚀",
    title: "Traffic Engine",
    subtitle: "Distribution",
    steps: ["Social", "Paid Ads", "Email"],
    enabled: false,
  },
];
```

For the Offer Engine click handler, we query the skill ID by name at mount time so it stays dynamic:

```typescript
const { data: offerSkill } = useQuery({
  queryKey: ["offer-engine-skill"],
  queryFn: async () => {
    const { data } = await supabase
      .from("skills")
      .select("id")
      .eq("name", "Million Dollar Message")
      .single();
    return data;
  },
});
```

| File | Action |
|------|--------|
| `src/pages/UserHome.tsx` | Rewrite — static engine cards, remove skills query, add offer engine skill lookup |

