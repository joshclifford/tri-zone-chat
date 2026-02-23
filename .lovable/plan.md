
# Kimi-Style Chat: Remove Bubbles, Use Whitespace

## Problem
Chat messages use colored bubble backgrounds (`bg-primary` for user, `bg-muted` for assistant) with a narrow `max-w-[85%]` constraint, making text feel cramped. Kimi uses a clean, open layout with no bubble backgrounds -- just text with generous whitespace.

## Changes

### `src/components/interview/InterviewMessage.tsx`
- **Remove bubble backgrounds** for both user and assistant messages
- **Remove `max-w-[85%]`** constraint -- let messages use full container width
- **Remove `rounded-xl` padding/background** styling
- Assistant messages: left-aligned, no background, just text with prose styling
- User messages: right-aligned, subtle text color differentiation (e.g. `text-muted-foreground`) instead of a colored bubble
- Keep the fade-in animation
- Increase text size from `text-sm` to `text-base` for better readability

### `src/components/shared/ChatInterface.tsx`
- Widen the content container from `max-w-2xl` (672px) to `max-w-3xl` (768px) to give text more room
- Same change on the input bar container

### `src/components/interview/InterviewChat.tsx`
- Widen `max-w-[700px]` to `max-w-3xl` (768px) to match

## Visual Result
- Assistant messages: full-width left-aligned plain text with markdown rendering, no background
- User messages: right-aligned text, slightly muted color, no bubble
- More horizontal space for content
- Clean whitespace between messages (existing `mb-4` spacing)
