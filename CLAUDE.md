# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marketing, documentation, and support website for the Chorus browser extensions: [Chorus for Spotify](https://github.com/chorus-studio/chorus) (live) and Chorus for YouTube (covers youtube.com and music.youtube.com; not in a store yet, early builds go out through the Discord). One site and one Discord serve both. Hosted on Cloudflare Pages at [chorusstudio.org](https://chorusstudio.org).

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
- **UI Components**: Svelte 5 via `@astrojs/svelte`. Home page sections live in `src/components/home/` (interactive ones are Svelte islands, static ones are `.astro`); the `/demo` page's audio demo lives in `src/components/demo/`. Icons come from `@lucide/svelte`, imported per icon (`@lucide/svelte/icons/pin`).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`
- **Package Manager**: Bun
- **Hosting**: Cloudflare Pages (static output)
- **Other integrations**: `@astrojs/sitemap`

## Architecture

The site has two distinct page systems that are styled differently:

### 1. Custom pages (Landing layout)
Pages in `src/pages/` — landing (`index.astro`), `install.astro`, `uninstall.astro`, `changelog.astro`, `downloads.astro`, `demo.astro` — use `src/layouts/Landing.astro` as their layout. This layout provides its own `<html>`, `<head>` (Google Fonts: Inter, Space Grotesk, Space Mono), nav, footer, and loads Tailwind via `import '../styles/global.css'` in the frontmatter. These pages use raw Tailwind classes.

### Two hosts: Spotify and YouTube
The home page switches between Spotify and YouTube with the switch in the hero. The host lives on `<html data-host>` (absent means Spotify), set before first paint by an inline script in `Landing.astro` from `?host=youtube` or the visitor's last choice (`localStorage` key `chorus-host`).
- **Colour**: `--host`, `--host-strong` and `--host-ink` in `global.css` change with the host (green `#1ED760` on Spotify, red `#FF0033` on YouTube, the same signal tokens the extensions use). Use them through Tailwind: `text-host`, `bg-host/10`, `bg-host-strong text-host-ink`. Don't hard-code either brand colour for the site's own chrome.
- **Static copy**: the `yt:` and `sp:` variants show markup on one host only, e.g. `<span class="yt:hidden">Block artists</span><span class="hidden yt:inline">Block channels</span>`.
- **Svelte islands**: read the host with `useHost()` from `src/lib/host.svelte.ts` (it reports Spotify until mount so hydration matches the server HTML) and change it with `setHost()`.
- **Links**: store, Discord and other URLs are in `src/lib/site.ts`. A Firefox visitor's store buttons (`data-store-link`) are pointed at Firefox Add-ons by a script in `Landing.astro`.
- **Media**: the clips in `public/media/` are cut from the Spotify extension's Remotion promo (`../extension/promo`). The `-yt` clips are the same footage recoloured red with ffmpeg, a stand-in until a real YouTube cut exists.
- **Routes**: `/install` and `/uninstall` are hard-coded in the Spotify extension and must keep working. The YouTube extension hard-codes `/youtube/install` and `/youtube/uninstall` (`src/pages/youtube/`). These pages pass `host` to `Landing.astro`, which pins the page to that extension and remembers it for the visitor's next visit to the home page.

### Motion
Shared keyframes live in `global.css`, used through arbitrary utilities (`animate-[marquee_48s_linear_infinite]`). `.reveal` and `.popin` are scroll-driven entrances (no-ops where `animation-timeline` isn't supported). Animation is switched off under `prefers-reduced-motion` for anything inside `body.landing`. Islands use `src/lib/motion.ts`: `autoplay` (an attachment for muted looping clips), `visibility()` (to pause demo loops off screen) and `prefersReducedMotion()`.

### 2. Starlight docs/blog
Documentation lives in `src/content/docs/` as Markdown files. Blog posts are in `src/content/blog/`. These use Starlight's built-in layout with sidebar navigation. Starlight routes are served at root (e.g., `/features/snips/` not `/docs/features/snips/`). Starlight theming is done via CSS custom properties (`--sl-color-accent-*`) in `src/styles/global.css`, loaded via `customCss` in `astro.config.mjs`.

### GitHub API at build time
`changelog.astro` and `downloads.astro` fetch releases from `https://api.github.com/repos/chorus-studio/chorus/releases` at build time in their frontmatter. If the fetch fails, they gracefully degrade to a fallback message with a link to GitHub.

### Extension integration
The Chorus browser extension's `background.ts` redirects users to `chorusstudio.org/install` on first install and sets `chorusstudio.org/uninstall` as the uninstall URL. The YouTube extension does the same with `/youtube/install` and `/youtube/uninstall`.

### Support and feedback email
Two forms send email, each through a Cloudflare Pages Function (Pages picks up `functions/` from the repo root and serves it beside the static build). Both share `src/lib/email-server.ts`.
- **Uninstall feedback**: `/uninstall` and `/youtube/uninstall` use `src/components/UninstallForm.astro` and POST `{ host, version, browser, usedFor[], reason, plan, details, replyEmail, honeypot }` to `functions/api/uninstall-feedback.ts`. Plans are `free`, `pro-trial`, `pro` and `not-sure` (Chorus Pro is sold through Polar).
- **Support**: `/support` POSTs `{ host, topic, subject, email, message, version, browser, pageUrl, honeypot }` to `functions/api/support.ts`. Topics are `SUPPORT_TOPICS` in `src/lib/site.ts`, and the email is required so there's someone to reply to.
- **Extra context**: `version` and `browser` come from `?version=` and `?browser=` when the extension adds them to its link; otherwise the browser is detected (`src/lib/browser.ts`). The hidden `website` field is a honeypot: when it's filled the endpoint answers ok and sends nothing.
- **Sending**: the functions call an `EMAIL_WORKER` service binding (`POST https://email-worker/send` with `{ kind, subject, body, replyEmail }`) that must be added to the Pages project in the Cloudflare dashboard; without it they answer 503. The forms show the endpoint's error message and let the visitor retry.
- **The worker**: the binding points at the Chorus email worker in `workers/email-worker/`, deployed on its own with Wrangler (`cd workers/email-worker && npx wrangler deploy`). It has no public URL (`workers_dev = false`), so only the binding can reach it. It sends `kind: 'support'` from `support@chorusstudio.org` and `kind: 'feedback'` from `feedback@chorusstudio.org` (`SUPPORT_SENDER` and `FEEDBACK_SENDER` in its `wrangler.toml`; chorusstudio.org uses Cloudflare Email Routing). Mail goes to `RECIPIENT`, a secret (`npx wrangler secret put RECIPIENT`) that must be a verified Email Routing destination address. `Reply-To` is the visitor's email when they give one.
- **Keep private**: the inbox address stays out of the repo on purpose. Don't point the binding at another project's email worker.

### Dual styling approach
The layout chrome and the home page use the host tokens above for their accent and inline neutral hex values (e.g. `bg-[#121212]`, `text-[#b3b3b3]`). The older Landing pages (`install`, `uninstall`, `changelog`, `downloads`, `demo`) still inline the old Spotify green (`bg-[#1db954]`). Starlight pages use CSS custom properties (`--sl-color-accent-*`) defined in `src/styles/global.css`.

## Brand Colors

- Host signal: Spotify `#1ed760`, YouTube `#ff0033` (buttons `#e0002d`), as `--host*` tokens
- Older green (docs accent and older Landing pages): `#1db954` / Dark green: `#1aa34a`
- Background: `#0a0a0a` (home), `#121212` / Card: `#181818`
- Text: `#ffffff` / Subtext: `#b3b3b3`
- Fonts: `font-body` (Inter), `font-display` (Space Grotesk), `font-code` (Space Mono)

CSS custom properties are defined in `src/styles/global.css` as `--chorus-*` variables.

## Sidebar Configuration

The Starlight sidebar is manually configured in `astro.config.mjs`. The Features section uses `autogenerate: { directory: 'features' }`, so adding a new Markdown file to `src/content/docs/features/` automatically adds it to the sidebar.

## Landing Layout Props

`src/layouts/Landing.astro` accepts `title` (required), `description` (optional, defaults to the Chorus tagline) and `host` (optional, `'spotify'` or `'youtube'`, pins the page to one extension). It provides a sticky floating nav (links collapse into a `<details>` menu below `md`), `<slot />` for page content, and a footer with Spotify, YouTube and More columns. Nav links point at home-page anchors (`/#presets`, `/#looks`, …), so they work from every page.
