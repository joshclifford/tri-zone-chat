

# Pre-Flight Mode Selector

## What Changes

Add a new phase `"mode-select"` between clicking the Lead Magnet Funnel card and entering the funnel chat. Users see two cards -- "Collaborate" and "Get It Done" -- before the funnel begins.

## Flow

```text
Interview --> Lock Foundation --> Grid --> Click Lead Magnet --> MODE SELECT --> Funnel (Collaborate)
```

## Implementation

### 1. New Phase in State Machine (`src/hooks/use-app-state.tsx`)

- Change `Phase` type from `"interview" | "grid" | "funnel"` to `"interview" | "grid" | "mode-select" | "funnel"`
- Add `workflowMode: "collaborate" | "get-it-done" | null` to state
- Modify `startFunnel` to set phase to `"mode-select"` instead of `"funnel"`, stashing the workflow config (type, steps) temporarily
- Add new `selectMode(mode)` function: sets `workflowMode`, creates the campaign, and transitions to `"funnel"` phase
- Persist `workflowMode` choice in localStorage (optional, low priority)

### 2. New Component: `ModeSelector` (`src/components/funnel/ModeSelector.tsx`)

- Header: "Before we build your Lead Magnet Funnel..."
- Subheader: "How do you want to work?"
- Two side-by-side cards (responsive: stacked on mobile):
  - **Collaborate** (Users icon): "Real-time collaboration with AI" -- bullet points: Step-by-step input, Approve each section, Live editing -- Button: "Start Collaborating"
  - **Get It Done** (Rocket icon): "Delegate and receive complete deliverables" -- bullet points: One strategic brief, Autonomous execution, Check back in 10 min -- Button: "Brief and Build"
- Clicking "Collaborate" calls `selectMode("collaborate")` which proceeds to funnel
- Clicking "Get It Done" shows a toast ("Coming in V2 -- starting Collaborate mode") and falls back to `selectMode("collaborate")`
- Kimi aesthetic: hairline borders, slate palette, indigo accent on hover/active, minimal shadows

### 3. Wire Into Index (`src/pages/Index.tsx`)

- Add a new `phase === "mode-select"` block in the AnimatePresence, rendering `<ModeSelector />` with fade-in animation
- Sits between the grid and funnel blocks

### 4. Files Changed

| File | Change |
|------|--------|
| `src/hooks/use-app-state.tsx` | Add `"mode-select"` phase, `workflowMode` state, `selectMode` function, update `startFunnel` |
| `src/components/funnel/ModeSelector.tsx` | New component -- two-card selector UI |
| `src/pages/Index.tsx` | Add `mode-select` phase rendering |

### 5. Technical Notes

- The pending workflow config (type + totalSteps) needs to be held in state between `startFunnel` and `selectMode`. A simple `pendingWorkflow: { type, steps } | null` field handles this.
- `returnToGrid` and `resetFoundation` should clear `workflowMode` and `pendingWorkflow` back to null.
- "Get It Done" card gets a subtle "V2" badge in the top-right corner, matching the disabled workflow card pattern.

