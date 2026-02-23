

# Skill CMS: Admin + User Modes

## What We're Building

A minimal skill management system with two sides:
- **Admin** (`/admin`) -- Create, edit, delete, and toggle skills using a simple form
- **User** (`/`) -- Browse active skills as cards, click one to start an AI-powered chat at `/chat/:skillId`

## Database

Two tables via Supabase migration:

**`skills`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | auto-generated |
| name | text | required |
| description | text | |
| system_prompt | text | the AI instructions |
| emoji | text | for card display, default "🔧" |
| reference_files | text[] | array of file URLs (future use) |
| is_active | boolean | default false |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

**`conversations`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | auto-generated |
| skill_id | uuid (FK) | references skills |
| messages | jsonb | array of {role, content} |
| status | text | "active" or "complete" |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

No RLS policies for V1 (open access).

## Edge Function: `chat`

A single edge function (`supabase/functions/chat/index.ts`) that:
- Accepts `{ messages, systemPrompt }` as POST body
- Calls the Lovable AI gateway for streaming responses
- Returns streamed text via SSE
- Uses `LOVABLE_API_KEY` (already provisioned)

## New Pages and Components

### Admin Page (`src/pages/Admin.tsx`)
- Route: `/admin`
- Top section: Form with inputs for Name, Description, Emoji, System Prompt (textarea)
- Save button inserts/updates skill in Supabase
- Bottom section: List of all skills as rows with:
  - Name + description preview
  - Toggle switch for `is_active`
  - Edit button (loads skill into the form above)
  - Delete button (with confirmation)
- Uses `@tanstack/react-query` for data fetching

### User Home (`src/pages/UserHome.tsx`)
- Route: `/`
- Grid of active skills fetched from `skills` table (where `is_active = true`)
- Each card shows emoji, name, description
- Click navigates to `/chat/:skillId`

### Skill Chat (`src/pages/SkillChat.tsx`)
- Route: `/chat/:skillId`
- Fetches skill by ID from Supabase to get `system_prompt`
- Streaming chat interface using the `chat` edge function
- Message bubbles reuse existing `InterviewMessage` component styling
- Input bar at bottom (same pattern as `InterviewChat`)
- Back button to return to grid

### Shared Chat Interface (`src/components/shared/ChatInterface.tsx`)
- Reusable streaming chat component
- Props: `systemPrompt`, `initialMessage?`, `onComplete?`
- Handles: message state, streaming SSE parsing, auto-scroll, input
- Used by `SkillChat` (and later by admin for testing)

## Routing Changes (`src/App.tsx`)

```text
/              -> UserHome (skills grid)
/chat/:skillId -> SkillChat (execute a skill)
/admin         -> Admin (skill CMS)
```

The existing interview/funnel flow will be removed from the index route. The old components remain in the codebase but are no longer routed to.

## Layout

All pages wrapped in `AppLayout`. The header keeps the Customer Engine OS logo. The left drawer will show a link to Admin for convenience.

## Seed Data

After migration, insert one starter skill -- "Million Dollar Message" -- so the grid isn't empty on first load.

## File Summary

| File | Action |
|------|--------|
| Supabase migration | New -- create `skills` + `conversations` tables + seed data |
| `supabase/functions/chat/index.ts` | New -- AI streaming edge function |
| `src/integrations/supabase/types.ts` | Updated -- regenerated types |
| `src/pages/Admin.tsx` | New -- skill CMS form + list |
| `src/pages/UserHome.tsx` | New -- active skills grid |
| `src/pages/SkillChat.tsx` | New -- chat execution page |
| `src/components/shared/ChatInterface.tsx` | New -- reusable streaming chat |
| `src/App.tsx` | Updated -- new routes |
| `src/components/layout/LeftDrawer.tsx` | Updated -- add Admin nav link |

