
# Emoji Selector for Skill Creation

## Current State
The emoji field is a plain text `<Input>` where users must type/paste an emoji manually. This is unintuitive.

## Solution
Replace the text input with a clickable emoji button that opens a popover containing a grid of common emojis. Clicking an emoji selects it and closes the popover. The selected emoji displays on the button.

No new dependencies needed -- we already have `Popover` and `PopoverContent` from Radix.

## Implementation

### Changes to `src/pages/Admin.tsx`

1. Import `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`
2. Replace the emoji `<Input>` with a `<Popover>` containing:
   - **Trigger**: A button showing the currently selected emoji (large, centered)
   - **Content**: A grid of ~40 commonly useful emojis (organized in rows), each clickable
3. On emoji click: update `form.emoji` and close the popover

### Emoji Set
A curated set of ~40 emojis relevant to business/skill contexts:
`🔧 🎯 💡 🚀 📝 💬 🎨 📊 🧠 💰 📣 🔍 ✍️ 📱 🎓 🤝 ⚡ 🏆 📈 🛠️ 💎 🔑 📋 🎤 💪 🌟 📢 🧩 🎁 ❤️ 🔔 📚 🤖 🎬 🌍 ✅ 🏷️ 💼 🗂️ 🧲`

### UX Details
- Button size: same 60px column width as current input
- Popover grid: 8 columns of emojis, each ~36px tap target
- Popover width: ~320px
- Solid background on popover (not transparent)
- High z-index (handled by Radix defaults)

No other files change.
