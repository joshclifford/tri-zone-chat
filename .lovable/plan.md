

# Rename to "Customer Engine OS" + Add Logo to Header

## Changes

### 1. Copy the uploaded logo into the project
- Copy `user-uploads://image.png` to `src/assets/customer-engine-logo.png`
- The logo appears to be white on transparent -- it will be displayed with a CSS `filter: invert(1)` or `brightness(0)` to render it black

### 2. Update the header in `src/components/layout/AppLayout.tsx`
- Replace the text "Growth OS" with an `<img>` tag importing the logo from `src/assets/customer-engine-logo.png`
- Apply `filter: brightness(0)` (or `className="invert dark:invert-0"`) to make the white logo appear black in light mode
- Set appropriate height (~20-24px) and alt text "Customer Engine OS"
- Keep the hamburger menu button as-is

### 3. Update `index.html`
- Change `<title>` from "Lovable App" to "Customer Engine OS"
- Update `og:title` meta tag to "Customer Engine OS"
- Update `meta description` to match

### 4. Update any other references to "Growth OS"
- The left drawer or interview chat may reference "Growth OS" in text -- these will be updated to "Customer Engine OS"

### Files Modified
| File | Change |
|------|--------|
| `src/assets/customer-engine-logo.png` | New -- copied from upload |
| `src/components/layout/AppLayout.tsx` | Replace "Growth OS" text with logo image |
| `index.html` | Update title and meta tags |

