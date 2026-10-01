# How the two skills were tested

The skills live in `.claude/skills/` (Claude Code format; also usable as Cursor rules by copying the body).

## Method
1. Pick a feature that needs **both** skills, with the skills **removed** (rename `.claude/skills` to `.claude/skills.off`). Run the prompt, save the result and the chat link.
2. Reset the branch, restore `.claude/skills`, run the **same prompt**, save the result and the chat link.
3. Compare, then run `pnpm verify` on both.

## Test prompts
- **A (data + UI):** "Add a Favorites feature: a heart button in the photo lightbox that toggles favorites, and a Favorites tab showing only favorited photos in the grid."
- **B (data):** "Add a per-page selector (12/24/48) and show a friendly message for rate-limit errors."
- **C (UI):** "Add a second layout option to the grid: uniform square thumbnails instead of columns."

## Results (fill in)
| Prompt | Without skills | With skills | Evidence |
|---|---|---|---|
| A | _what went wrong / what was different_ | _…_ | _chat link, `pnpm verify` output_ |
| B | | | |
| C | | | |

Things to look for: imports from `media-core` in the app, hand-written `fetch` or pagination state, styles added inside `media-ui-react`, custom Esc/focus code in the lightbox, `trackView` on every render, missing loading/error/empty states, missing `:focus-visible`.
