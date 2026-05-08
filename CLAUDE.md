# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-page personal browser start page ("二次元正太风") — real-time clock, multi-engine search with suggestions, and shortcut links. Pure vanilla HTML/CSS/JS with no frameworks, no build tools, and no dependencies.

See **AGENTS.md** for the full design system (color tokens, shadows, border radii, easing curves) and module documentation.

## Architecture

Files loaded by `index.html` in this order:

1. **`css/style.css`** — All visual design. CSS custom properties in `:root` define the design token system. The container uses absolute centering. Search field is a flex row (engine selector + input). Focus effects use `:focus-within` on the parent. Responsive breakpoint at 480px. Also contains the background ambience styles: layered `position: fixed` divs (`.ambient-base`, `.ambient-blobs`, `.ambient-particles`) at z-index 0–2, sitting below the main container at z-index 10.

2. **`main.js`** — Clock only. `updateClock()` runs every second via `setInterval`. Must stay lean — no search or UI logic here.

3. **`js/search.js`** — Search engine switcher, search suggestions, and search execution.
   - `engines` array at the top defines available search engines (baidu, google, bing, duckduckgo). Adding a new engine only requires appending to this array.
   - User's preferred engine persists to `localStorage` key `preferred_engine` (with silent fallback on error).
   - Search suggestions use Baidu's JSONP API (`suggestion.baidu.com/su`) with 150ms debounce.
   - JSONP callback and script tags are cleaned up after each request to prevent memory leaks.
   - Keyboard navigation: ArrowUp/ArrowDown/Enter/Escape on the suggestions list.
   - Clicks outside the engine dropdown or suggestions box close them.

4. **`js/ambience.js`** — Background floating particles (sunlight dust effect). Creates 20 SVG particles (4-pointed stars, bubbles, crossed stars) that drift across the viewport in 8 directions with sine-wave oscillation. Uses `requestAnimationFrame` loop. Particles reset when off-screen or expired. Self-contained IIFE — no exports, no external dependencies.

## Key constraints

- **Single accent color**: `#FFB7A5` (warm apricot). No second saturated color.
- **No pure black**: Text is `#5A4A42`, borders use translucent white/inner shadow.
- **File separation**: Search logic stays in `js/search.js`, styles in `css/style.css`, clock in `main.js`, ambience particles in `js/ambience.js`. Do not merge them back.
- **localStorage**: Always wrap in try/catch (private browsing compatibility).
- **Design tokens**: Always reference CSS custom properties from `:root` — never hardcode color/shadow/radius values in selectors.

## Development

No build step. Open `index.html` directly in a browser. There is no test suite, linter, or dev server.
