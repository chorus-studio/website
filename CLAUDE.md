# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marketing, documentation, and support website for the [Chorus](https://github.com/chorus-studio/chorus) browser extension (Spotify Enhancer). Hosted on Cloudflare Pages at [chorusstudio.org](https://chorusstudio.org).

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (localhost:4321)
bun run build        # Build static site to dist/
bun run preview      # Preview production build
```

No test runner, linter, or formatter is configured.

## Tech Stack

- **Framework**: Astro 5 + Starlight (docs/blog) + `starlight-blog` plugin
- **UI Components**: Svelte 5 via `@astrojs/svelte` (installed but `src/components/` is currently empty — all interactivity is inline `<script>` in Astro files)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`
- **Package Manager**: Bun
- **Hosting**: Cloudflare Pages (static output)
- **Other integrations**: `@astrojs/sitemap`

## Architecture

The site has two distinct page systems that are styled differently:

### 1. Custom pages (Landing layout)
Pages in `src/pages/` — landing (`index.astro`), `install.astro`, `uninstall.astro`, `changelog.astro`, `downloads.astro` — use `src/layouts/Landing.astro` as their layout. This layout provides its own `<html>`, `<head>`, nav, footer, and loads Tailwind via `import '../styles/global.css'` in the frontmatter. These pages use raw Tailwind classes with hardcoded brand color values (e.g., `bg-[#1db954]`, `text-[#b3b3b3]`).

### 2. Starlight docs/blog
Documentation lives in `src/content/docs/` as Markdown files. Blog posts are in `src/content/blog/`. These use Starlight's built-in layout with sidebar navigation. Starlight routes are served at root (e.g., `/features/snips/` not `/docs/features/snips/`). Starlight theming is done via CSS custom properties (`--sl-color-accent-*`) in `src/styles/global.css`, loaded via `customCss` in `astro.config.mjs`.

### GitHub API at build time
`changelog.astro` and `downloads.astro` fetch releases from `https://api.github.com/repos/chorus-studio/chorus/releases` at build time in their frontmatter. If the fetch fails, they gracefully degrade to a fallback message with a link to GitHub.

### Extension integration
The Chorus browser extension's `background.ts` redirects users to `chorusstudio.org/install` on first install and sets `chorusstudio.org/uninstall` as the uninstall URL. The uninstall page has a client-side feedback form that POSTs to `/api/uninstall-feedback` — this Cloudflare Worker endpoint is **not in this repo** (deployed separately).

### Dual styling approach
Custom pages (Landing layout) use hardcoded Tailwind color values (e.g., `bg-[#1db954]`). Starlight pages use CSS custom properties (`--sl-color-accent-*`) defined in `src/styles/global.css`. Both systems share `--chorus-*` variables but the Landing pages don't reference them — they inline the hex values directly. Keep this consistent when editing either system.

## Brand Colors

- Primary green: `#1db954` / Dark green: `#1aa34a`
- Background: `#121212` / Card: `#181818`
- Text: `#ffffff` / Subtext: `#b3b3b3`

CSS custom properties are defined in `src/styles/global.css` as `--chorus-*` variables.

## Sidebar Configuration

The Starlight sidebar is manually configured in `astro.config.mjs`. The Features section uses `autogenerate: { directory: 'features' }`, so adding a new Markdown file to `src/content/docs/features/` automatically adds it to the sidebar.

## Landing Layout Props

`src/layouts/Landing.astro` accepts `title` (required) and `description` (optional, defaults to the Chorus tagline). It provides a fixed nav bar, `<slot />` for page content, and a 4-column footer. The nav is hidden on mobile (no hamburger menu yet).
