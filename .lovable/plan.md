

# Fix: Chat Input Bar Hidden Below Viewport

## Problem
The chat input bar is rendered in the code but pushed off-screen. The AI's opening message is very long, and the scroll container isn't properly constrained, causing the entire ChatInterface to overflow instead of scrolling internally.

## Root Cause
The layout chain uses flexbox, but `ChatInterface`'s root div uses `h-full` instead of `flex-1 min-h-0`. Without `min-h-0`, the flex child's content (the long message) forces the container to grow beyond the viewport, pushing the input bar out of view.

## Fix

### `src/components/shared/ChatInterface.tsx`
- Change the root div from `h-full` to `flex-1 min-h-0` so it stays within its parent's bounds
- This ensures the scrollable message area is constrained and the input bar stays pinned at the bottom

### `src/pages/SkillChat.tsx`
- Wrap the `ChatInterface` in a `flex-1 min-h-0` container so the flex layout propagates correctly through the component tree

Both changes are single-line CSS class tweaks. No logic changes needed.

