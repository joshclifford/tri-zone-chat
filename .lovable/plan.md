

# Remove Assistant Avatar Icon — Indent Only

## Change

Update `src/components/interview/InterviewMessage.tsx` to remove the Bot icon avatar from assistant messages. Instead, assistant messages will simply have a left indent (padding) for visual distinction from right-aligned user bubbles.

## Technical Detail

In `InterviewMessage.tsx`:
- Remove the `Bot` import from lucide-react
- Remove the circular avatar `div` from the assistant message branch
- Keep the `flex items-start gap-3` layout but replace the icon with a `pl-3` or `ml-2` indent on the assistant wrapper
- User messages remain right-aligned with `bg-muted` bubble (no changes)

The result: assistant text sits flush-left with slight indent, user bubbles sit right — clean visual separation without any icon clutter.

| File | Action |
|------|--------|
| `src/components/interview/InterviewMessage.tsx` | Update — remove Bot icon, add left indent |

