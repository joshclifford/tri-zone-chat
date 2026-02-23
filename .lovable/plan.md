

# Interactive Chat Patterns and Inline Artifacts

## Overview

Transform the chat from a plain text Q&A into a collaborative workspace with rich inline elements: clickable option chips, animated thinking states, artifact preview cards that open the right panel, and step dividers. The ArtifactCard will have a pulse animation on first render to invite clicking, and clicking it will slide in the right panel with full content.

## New Components to Create

### `src/components/chat/InlineOptionChips.tsx`
Pill-shaped clickable chips rendered inline below an AI message. Includes optional "Write my own..." chip. Clicking a chip sends that text as a user message. Style: `rounded-full border border-border bg-background text-sm hover:border-primary/40`.

### `src/components/chat/ThinkingState.tsx`
Enhanced typing indicator (no bubble background to match Kimi style):
- Three animated dots with contextual status text (e.g., "Analyzing your voice profile...")
- Optional progress checklist with checkmark/circle icons updating in real-time
- Shimmer placeholder blocks for anticipation

### `src/components/chat/ArtifactCard.tsx`
Rich inline card for generated content:
- Hairline border with `bg-muted/5`, left indigo accent (`border-l-2 border-l-primary`)
- File type icon, title, 2-line preview, "Generated just now" timestamp
- Small inline action buttons: Expand, Copy, Download
- **Entire card is clickable** -- calls `useLayout().openRightPanel()` with the artifact data
- **Pulse animation on mount**: A subtle `animate-pulse` ring effect (1-2 cycles) on the card border when it first appears, fading out after ~2 seconds. This draws the user's eye and invites them to click
- The artifact data (title, type, full content) is passed through a new `artifactData` field on the layout context so RightPanel can render it

### `src/components/chat/StepDivider.tsx`
Subtle "Step X of Y" divider between conversation sections. Horizontal line with centered text badge.

## Files to Modify

### `src/hooks/use-layout.tsx`
- Extend `rightPanelContent` type to include optional artifact data:
  ```typescript
  rightPanelContent: {
    title: string;
    type: string;
    artifactData?: { preview: string; content: Record<string, unknown>; assetType: string };
  } | null;
  ```
- Update `openRightPanel` to accept this extended type

### `src/components/layout/RightPanel.tsx`
- Read `artifactData` from `rightPanelContent` when available
- Render the artifact's full content (formatted text) when opened via an ArtifactCard click
- Falls back to existing asset-based rendering when no artifactData is present

### `src/components/shared/ChatInterface.tsx`
- Extend the `Message` interface with optional `type` and `metadata` fields:
  ```typescript
  interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    type?: "text" | "options" | "artifact" | "thinking" | "divider";
    metadata?: {
      options?: string[];
      allowCustom?: boolean;
      artifact?: { id: string; title: string; preview: string; assetType: string; content: Record<string, unknown> };
      thinkingStatus?: string;
      thinkingSteps?: Array<{ label: string; done: boolean }>;
      stepInfo?: { current: number; total: number };
    };
  }
  ```
- Add a message renderer that switches on `type`:
  - `text` (default): renders via `InterviewMessage`
  - `options`: renders text + `InlineOptionChips` below
  - `artifact`: renders `ArtifactCard`
  - `thinking`: renders `ThinkingState`
  - `divider`: renders `StepDivider`
- Add `onChipSelect` handler: sends chip text as user message
- After streaming completes, parse assistant content for artifact markers (e.g., `[ARTIFACT:...]`) and split into text + artifact card messages
- Import and use `useLayout` for artifact click handling

### `src/components/interview/InterviewChat.tsx`
- Replace current `OptionChips` with new `InlineOptionChips` rendered inline after assistant messages in the stream
- Update `TypingIndicator` usage to use new `ThinkingState` with status text per turn
- Add approval gate chips ("Looks good" / "Make changes") after the summary step

### `src/components/interview/TypingIndicator.tsx`
- Remove the bubble background (`bg-muted rounded-xl`) to match Kimi whitespace style
- Add optional `statusText` prop for contextual messages
- Add optional `steps` prop for progress checklist rendering

## ArtifactCard Pulse Animation Detail

The card uses framer-motion for a subtle highlight on mount:
1. On initial render, a `box-shadow` ring animation plays (indigo glow expanding and fading)
2. The animation runs for 2 cycles (~2 seconds total) then stops
3. After animation completes, the card remains static with its normal border styling
4. This uses `motion.div` with `animate={{ boxShadow: [...] }}` and `transition={{ repeat: 1, duration: 1 }}`

## ArtifactCard Right Panel Integration

When a user clicks the ArtifactCard:
1. The card's `onClick` calls `openRightPanel({ title: artifact.title, type: artifact.assetType, artifactData: { preview, content, assetType } })`
2. `RightPanel` reads `rightPanelContent.artifactData` and renders the full content as formatted markdown/structured layout
3. The panel slides in from the right with the existing framer-motion animation (already implemented)
4. The card in the chat stream remains visible -- the panel is a "focused lens" on that card

## File Summary

| File | Action |
|------|--------|
| `src/components/chat/InlineOptionChips.tsx` | Create |
| `src/components/chat/ThinkingState.tsx` | Create |
| `src/components/chat/ArtifactCard.tsx` | Create |
| `src/components/chat/StepDivider.tsx` | Create |
| `src/hooks/use-layout.tsx` | Update -- extend rightPanelContent type |
| `src/components/layout/RightPanel.tsx` | Update -- handle artifactData rendering |
| `src/components/shared/ChatInterface.tsx` | Update -- type-based message rendering, chip handling, artifact parsing |
| `src/components/interview/InterviewChat.tsx` | Update -- use new inline components |
| `src/components/interview/TypingIndicator.tsx` | Update -- remove bubble, add status text |

