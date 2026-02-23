

# Growth OS V1 — Interview-First Implementation

## Overview

Replace the current "workflow grid on landing" with a gated interview flow. New users land directly in a Brand Foundation interview. Only after locking their Voice + Positioning does the workflow grid appear -- with only Lead Magnet Funnel active and 3 other workflows grayed out as "V2."

## Architecture

### New App State Machine

The app has 3 sequential phases, managed by a new context/hook:

```text
[Interview] --lock--> [Grid] --select workflow--> [Funnel Execution] --complete--> [Grid]
```

A new `useAppState` hook tracks:
- `phase`: "interview" | "grid" | "funnel"
- `foundationLocked`: boolean
- `voiceProfile`: object (locked brand voice data)
- `positioning`: object (locked positioning data)
- `activeCampaign`: campaign metadata when in funnel phase

For V1, state lives in React context (localStorage persistence). Database tables created but wired in later phases.

### Component Structure

```text
src/
  hooks/
    use-app-state.tsx          -- Phase state machine + foundation data
  components/
    interview/
      InterviewChat.tsx        -- The 5-7 turn mock conversation engine
      InterviewMessage.tsx     -- Individual message bubble (user or AI)
      OptionChips.tsx          -- Clickable chip selectors for interview choices
      FoundationSummary.tsx    -- "Lock It In" / "Keep Refining" card
    discovery/
      DiscoveryGrid.tsx        -- Updated: only renders when foundation locked
      WorkflowCard.tsx         -- Updated: accepts `disabled` + "V2" badge props
    funnel/
      FunnelChat.tsx           -- Step-based conversation for Lead Magnet workflow
      StepProgress.tsx         -- "Step 1 of 3: Lead Magnet" header bar
      ArtifactPreviewCard.tsx  -- Compact card in chat stream (click opens right panel)
    layout/
      LeftDrawer.tsx           -- Updated: shows foundation status, grayed skills
      RightPanel.tsx           -- Updated: renders artifact content by type
      CenterStream.tsx         -- No major changes
      AppLayout.tsx            -- No major changes
  pages/
    Index.tsx                  -- Orchestrates phases via useAppState
```

## Phase 1: The Foundation Interview

### InterviewChat Component
- A scripted 5-7 turn mock conversation with realistic branching
- Each turn is an object: `{ id, role, content, options?, type }` where type can be "text", "chips", "summary"
- Turn sequence:
  1. "What does your business do?" (free text)
  2. Hook pressure test: 3 generated options + "Write my own" chip
  3. Messaging iteration: present 2-3 angle options, allow remix via text
  4. Voice tone selection: chips for tone (e.g., "Bold & Direct", "Warm & Conversational", "Expert & Authoritative")
  5. Positioning angle refinement: present a synthesized angle, allow edits
  6. Summary card with extracted Voice Profile + Positioning
  7. "Lock It In" / "Keep Refining" action buttons

### Mock Logic
- Responses are template-based, injecting the user's business description into pre-written variations
- No AI API calls -- realistic static responses that feel dynamic by interpolating user input
- Typing indicator (shimmer/dots) with 800-1200ms delay before each AI message appears

### Left Drawer During Interview
- Shows "Brand Foundation" section with "(In Progress)" status dot
- Skills list grayed out with "Coming Soon" labels
- No campaigns section yet

### Right Panel During Interview
- Stays closed -- no artifacts generated yet

## Phase 2: Foundation Locked (Grid Unlocks)

### Lock Transition
- Click "Lock It In" saves voice + positioning to app state (and localStorage)
- Animation: interview chat fades out, workflow grid slides in from below
- Left drawer updates: "Brand Foundation" shows green dot + locked summary (voice profile snippet, positioning angle -- read-only, no edit button in V1)

### Updated DiscoveryGrid
- Only 4 cards rendered (same as current)
- Lead Magnet Funnel: fully interactive, normal styling
- Product Launch, Content Strategy, Email Sequence: rendered with `opacity-50`, `pointer-events-none`, and a small "V2" badge in top-right corner
- Clicking a disabled card does nothing (or shows a subtle toast: "Coming in V2")

### Left Drawer Updates
- "Brand Foundation" section: expandable to show locked Voice + Positioning (read-only)
- "Skills" section: all items grayed with "Coming Soon" text
- "Campaigns" section: empty state text "No campaigns yet"

## Phase 3: Lead Magnet Funnel Execution

### FunnelChat Component
- 3-step sequential flow, each step is a mini-conversation
- Step tracking via `StepProgress` bar at the top

**Step 1 -- Lead Magnet (skill: 'lead-magnet')**
- Ask: "What topic should the lead magnet cover?" + "What format?" (chips: Checklist, Guide, Cheat Sheet, Quiz)
- Generate: Mock magnet content (title, sections, body text)
- Output: ArtifactPreviewCard in chat + Right Panel opens with full formatted content
- "Continue to Step 2" button appears in chat

**Step 2 -- Landing Page (skill: 'landing-page')**
- Context from Step 1 auto-injected (magnet title, hook)
- Ask: "Any specific audience segment for the landing page?" 
- Generate: Mock landing page copy (headline, subhead, bullets, CTA)
- Output: Right Panel updates to show landing page content
- "Continue to Step 3" button

**Step 3 -- Email Sequence (skill: 'email-sequences')**
- Context from Steps 1+2 auto-injected
- Ask: "How many emails?" (chips: 3, 5, 7) + "Tone already set from your foundation"
- Generate: Mock email sequence (subject lines, body previews)
- Output: Right Panel shows tabbed email view (one tab per email)
- "Complete Funnel" button

### Completion
- All 3 assets saved to app state
- Campaign marked as complete
- Returns to grid view
- Left drawer: campaign appears under "Campaigns" section with completion badge

### ArtifactPreviewCard
- Compact inline card in chat: icon + title + "Generated" badge + click area
- Clicking opens/updates the Right Panel with that artifact's full content

### Right Panel Updates
- Renders different layouts based on artifact type:
  - Lead Magnet: formatted document view (title, sections, paragraphs)
  - Landing Page: structured copy view (headline, bullets, CTA blocks)
  - Email Sequence: tabbed view with individual email content per tab

## Database Tables (Created but not wired in V1 UI)

Tables to create via Supabase migration for future use:

- **projects**: id, user_id, name, foundation_locked (bool), voice_profile (jsonb), positioning (jsonb), interview_transcript (jsonb), created_at, updated_at
- **campaigns**: id, project_id, workflow_type (text), current_step (int), total_steps (int), status (text: 'active'/'complete'), context (jsonb for step-to-step data passing), created_at, updated_at
- **assets**: id, campaign_id, step_number (int), skill_name (text), title (text), content (jsonb), asset_type (text), status (text), created_at
- **brand_profiles**: id, project_id, voice_profile (jsonb), positioning (jsonb), locked_at (timestamptz)

RLS policies: all tables filtered by user_id (via auth.uid()). V1 uses localStorage; tables ready for Phase 2 wiring.

## Technical Details

### State Persistence (V1)
- `useAppState` persists to localStorage: foundation data, completed campaigns, generated assets
- On page reload, state restores to correct phase (interview if not locked, grid if locked, etc.)

### Mock Response Engine
- Template strings with interpolation: `"Great choice! A ${format} about "${topic}" is perfect for..."`
- 3-5 pre-written variations per turn, selected based on user input keywords
- Typing delay: 800-1200ms random, shown as animated dots

### Animation Choreography
- Interview to Grid: chat messages fade out (200ms) then grid slides up (300ms ease-out)
- Grid to Funnel: grid fades (200ms), step progress + chat fades in (250ms)
- Artifact card appears: slides in from below (200ms) with subtle scale
- Right Panel: existing 300ms slide-in from right

### Files Modified
- `src/pages/Index.tsx` -- orchestrate 3 phases
- `src/components/layout/LeftDrawer.tsx` -- foundation status, grayed skills, campaigns section
- `src/components/discovery/WorkflowCard.tsx` -- add disabled/V2 badge support
- `src/components/discovery/DiscoveryGrid.tsx` -- minor updates for disabled cards
- `src/components/layout/RightPanel.tsx` -- render artifact content by type

### New Files
- `src/hooks/use-app-state.tsx` -- phase state machine
- `src/components/interview/InterviewChat.tsx` -- conversation engine
- `src/components/interview/InterviewMessage.tsx` -- message bubbles
- `src/components/interview/OptionChips.tsx` -- chip selectors
- `src/components/interview/FoundationSummary.tsx` -- lock-in card
- `src/components/funnel/FunnelChat.tsx` -- step-based funnel conversation
- `src/components/funnel/StepProgress.tsx` -- step indicator bar
- `src/components/funnel/ArtifactPreviewCard.tsx` -- inline artifact card

