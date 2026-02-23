

# Fix Chat Message Rendering

## Problem
The AI's responses contain markdown formatting (`**bold**`, numbered lists, etc.) but the `InterviewMessage` component renders everything as plain text. This makes the opening message look like a wall of unformatted text with raw `**` markers everywhere.

## Solution

Two changes:

### 1. Add markdown rendering to chat messages

Install `react-markdown` and update `InterviewMessage` to render assistant messages through it. User messages stay as plain text.

**File: `src/components/interview/InterviewMessage.tsx`**
- Import `ReactMarkdown` from `react-markdown`
- Wrap assistant message content in `<ReactMarkdown>` with prose styling
- User messages remain plain text
- Add Tailwind prose classes (`prose prose-sm`) so headings, bold, lists, and paragraphs render properly

### 2. Use `VITE_SUPABASE_URL` instead of constructing the URL manually

**File: `src/components/shared/ChatInterface.tsx`**
- Replace the manually constructed `https://${projectId}.supabase.co/functions/v1/chat` with `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat` (best practice, already available in `.env`)

## Technical Details

### `src/components/interview/InterviewMessage.tsx`
- Add dependency: `react-markdown`
- Conditionally render: if `role === "assistant"`, wrap content in `<ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">`, otherwise render as plain text
- This ensures bold, lists, headings, and paragraphs display correctly

### `src/components/shared/ChatInterface.tsx`
- Line 53-54: Replace `const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID` and the constructed URL with `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`

No changes to the edge function or system prompt -- the AI is behaving correctly, we just need to render its markdown output properly.
