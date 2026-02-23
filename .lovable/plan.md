

# Growth OS V3 — Revised Implementation Plan

## Key Change: Workflows, Not Skills

Discovery shows **4 multi-step workflow cards** — each is a guided funnel that orchestrates individual skills automatically. Individual skills (Brand Voice, Keywords, etc.) live in the Left Drawer or fire as steps within workflows.

## Phase 1: Three-Zone Layout Shell

### Center Stream (Always Visible)
- Full-height chat area, max-width ~700px, centered with generous whitespace
- Sticky bottom input bar that grows with content
- Clean sans typography with 1.6 line-height

### Left Drawer (Memory Bank)
- **Collapsed**: Thin vertical icon strip (Projects, Brand, Assets) on left edge, monochrome
- **Open**: Slides right (250ms ease-out) revealing dense collapsible file tree
- Individual skills accessible here (Brand Voice, Keyword Research, SEO Content, etc.) — can be launched standalone from the drawer
- File names with status dots, dates; hover reveals actions
- Close via edge handle or clicking chat area

### Right Panel (Artifact Workbench)
- Triggered by clicking preview cards in chat
- Slides from right (300ms ease-out), ~40-50% width; chat compresses to ~50-60%
- Floating header: asset name + [X close] + [↗ expand full-screen]
- Close via X, clicking chat, or swipe (mobile)

### Responsive Behavior
- **Desktop**: Three zones coexist with push layout
- **Tablet**: Left drawer overlays with scrim; right panel as 60% modal
- **Mobile**: One zone at a time; full-screen slides

### Keyboard Shortcuts
- `[` toggle left drawer, `]` toggle right panel, `Esc` close panels

### Visual Language (Kimi Aesthetic)
- Hairline 1px borders, neutral slate/gray palette, single indigo accent for actions
- No gradients, minimal elevation shadows on panels only
- All motion: horizontal slides, 250-300ms ease-out
- Chat = airy, Drawer = dense, Panel = balanced

## Phase 2: Discovery, Chat Flow & Database

### Discovery Landing — 4 Workflow Cards

1. **💎 Lead Magnet Funnel** (3 steps) — Magnet → Landing Page → Emails
2. **🚀 Product Launch** (4 steps) — Positioning → Copy → Sequence → Creative
3. **✍️ Content Strategy** (3 steps) — Keywords → Blog → Distribution
4. **📧 Email Sequence** (1 step) — Standalone sequence builder

Each card shows workflow name, emoji icon, step count, and brief description of what it produces. Clicking one starts that workflow's guided multi-step conversation.

### Chat Transition & Step Progression
- Click workflow card → grid dissolves → chat begins at Step 1
- Progress indicator shows current step / total steps (e.g., "Step 1 of 3: Lead Magnet")
- Each step uses the appropriate skill automatically (e.g., Step 1 of Lead Magnet triggers the lead-magnet skill)
- Completing a step generates an artifact card in the stream, then auto-advances to next step
- Progressive disclosure: one question at a time within each step

### Left Drawer: Skills & Brand Builder
- **Brand Builder** accessible as a standalone tool from the left drawer (produces voice profile, positioning — foundational assets used by workflows)
- Other individual skills (Keyword Research, SEO Content, Direct Response Copy, etc.) also launchable from drawer for one-off use
- Past projects, campaigns, and assets browsable in drawer

### Supabase Database

**Projects** — user workspaces/brands

**Campaigns** (replaces "Conversations" as primary concept)
- project_id, workflow_type (lead-magnet-funnel, product-launch, content-strategy, email-sequence)
- current_step, total_steps
- status (in-progress, completed)
- created_at, updated_at

**Messages** — individual messages within a campaign's conversation
- campaign_id, role (user/assistant), content, created_at

**Assets** — generated content pieces
- campaign_id, skill_name (which skill generated it: 'lead-magnet', 'email-sequences', 'landing-page', 'positioning', etc.)
- title, content, asset_type, status
- step_number (which workflow step produced this)

**Brand Profiles** — voice, positioning, reference data per project

Row-level security policies for user data isolation. URL routing: `/project/{id}/campaign/{id}`, `/project/{id}/asset/{id}`

## Phase 3: Artifact Workbench Interactions

### Live Editing Surface
- Rich formatted content (headings, lists, styled text)
- Email sequences: tabbed view with individual emails
- Checklists with interactive checkboxes
- Direct editing in panel

### Chat-to-Panel Collaboration
- Chat instructions → panel shimmer → content updates live
- Edit in panel → "Sync to Chat" button appears

## Phase 4: AI Integration via Claude

- Supabase Edge Functions calling Claude API (Anthropic)
- Anthropic API key stored as Supabase secret
- Streaming responses with token-by-token rendering
- System prompts per skill — workflows chain the right skill prompts for each step automatically
- Conversation history for memory continuity within campaigns

## Phase 5: Polish & Advanced Features

- Left drawer populated with real data from Supabase
- Asset management (browse, reference, delete)
- Full-screen expand for workbench
- Mobile swipe gestures
- Loading states, error handling, edge cases

