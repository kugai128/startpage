# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-page personal browser start page ("二次元正太风") — real-time clock, multi-engine search with suggestions, shortcut links, dark mode, and customizable backgrounds. **Bing/Google-style layout**: content sits in the upper portion (margin-top: 14vh), 52px-tall search box is the visual centerpiece, clock is an auxiliary element at 52px. Pure vanilla HTML/CSS/JS with no frameworks, no build tools, and no dependencies.

**Authoritative docs**: See **PROJECT.md** for complete architecture, sizes, constraints, gotchas, and design evolution history. See **AGENTS.md** for design tokens and animation interface.

## Architecture

Files loaded by `index.html` in this exact order:

1. **`css/style.css`** — All visual design (~1380 lines). CSS custom properties in `:root` define the design token system. Dark mode overrides via `[data-theme="dark"]` attribute selector. `.container` is a pure layout wrapper (no card styling). Search field uses `:focus-within` for warm apricot focus glow. Responsive breakpoint at 480px. Background ambience: layered `position: fixed` divs (`.ambient-base`, `.ambient-blobs`, `.ambient-particles`) at z-index 0–2.

2. **`js/theme.js`** — Theme switcher (IIFE). Toggles `data-theme` attribute on `<html>` between `light` and `dark`. Persists to `localStorage` key `theme`. Falls back to `prefers-color-scheme: dark` if no saved preference. Watches system theme changes when user hasn't manually selected. Exposes `window.toggleTheme()` and `window.initTheme()`.

3. **`js/background.js`** — Background customization (IIFE). 5 preset gradients filtered by current theme (light: 棉花糖/薄荷奶绿/日落橙粉; dark: 星空暗蓝/深夜紫黑). Custom image upload via FileReader base64. Persists choice to `localStorage` keys `bg_type`, `bg_value`, `bg_control_theme`. Auto-switches to first matching-theme preset when theme changes. Settings panel rendered dynamically (`#settingsPanel`). Exposes `window.applyBackground()` and `window.initBackground()`.

4. **`js/clock.js`** — Clock (IIFE). Builds `HH:mm:ss` with `<span>` for individual digit animation control. Colon breathing animation (1.8s opacity cycle) + per-second colonPulse scale bounce. Tabular-nums for no jitter. Entry animation clockEnter.

5. **`js/search.js`** — Search engine switcher + suggestions.
   - `engines` array: baidu/google/bing/duckduckgo. Add engine = append to array.
   - Preferred engine persists to `localStorage` key `preferred_engine`.
   - Suggestions via Baidu JSONP API (`suggestion.baidu.com/su`), 150ms debounce.
   - JSONP callbacks and script tags cleaned up after each request.
   - Keyboard: ArrowUp/ArrowDown/Enter/Escape on suggestions list.
   - Clicks outside engine dropdown or suggestions box close them.
   - Engine switch uses CSS `.is-switching` for placeholder fade transition.

6. **`js/ambience.js`** — Background particles (IIFE). 50 SVG particles (star4/bubble/cross shapes) drifting across viewport in 8 directions with sine-wave oscillation. `requestAnimationFrame` loop, dt capped at 0.1s. Particles reset when off-screen or expired.

7. **`js/bookmark-manager.js`** — Bookmark CRUD (IIFE). Presets: B站/Google/ChatGPT/GitHub. Auto-detects favicons via Google S2 + DuckDuckGo fallback. Bilibili detection bypasses favicon. Modal for add/edit. Remove/enter animations.

8. **`js/greeting.js`** — Time-of-day greeting (IIFE). 5 rules (including 22:00-4:59 cross-midnight). Refreshes hourly with fade transition. Fixed bottom of viewport.

## Key constraints

- **Single accent color**: `#FFB7A5` (warm apricot). No second saturated color.
- **No pure black**: Text is `#5A4A42`, borders use translucent white/inner shadow.
- **File separation**: Each JS file owns one module. Styles only in `css/style.css`.
- **localStorage**: Always wrap in try/catch (private browsing compatibility).
- **Design tokens**: Always reference CSS custom properties from `:root` — never hardcode color/shadow/radius values in selectors.
- **IIFE + execution order**: All JS modules are IIFEs that run immediately. `<script>` tags must be placed AFTER their target DOM elements, or `getElementById` returns null. No `DOMContentLoaded` or `defer` used.
- **No global `*` transition**: Previously there was `* { transition: transform ... }` which conflicted with CSS animations and `position:fixed` centering. Removed in commit e3cdcd2.
- **Dark mode**: Use `[data-theme="dark"]` selectors in CSS. The accent desaturates to `#c9a89a` in dark mode. Focus glow shifts to a cool blue (`rgba(160,216,239,...)`) instead of apricot.
- **`data-control-theme`**: Body attribute set by background.js for control styling when on dark preset backgrounds. Separate from `data-theme`.

## Development

No build step. Open `index.html` directly in a browser. No test suite, linter, or dev server.
Deployed via GitHub Pages at https://kugai128.github.io/startpage/ — push to master deploys automatically.
