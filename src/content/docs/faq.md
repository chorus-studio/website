---
title: FAQ
description: Frequently asked questions about Chorus.
---

## General

### What is Chorus?

Chorus is a free, open-source browser extension that enhances the Spotify web player with advanced playback controls, audio effects, and track management features.

### Which browsers are supported?

Chorus works on:
- **Chrome** (and all Chromium browsers: Edge, Opera, Brave, Vivaldi, etc.)
- **Firefox**

### Does it work with the Spotify desktop app?

No. Chorus only works with the **Spotify web player** at [open.spotify.com](https://open.spotify.com). It cannot modify the desktop or mobile apps.

### Is Chorus free?

Yes, completely free and open source under the MIT license. Optional donations are welcome via [Ko-fi](https://ko-fi.com/cdrani).

## Features

### What are Snips?

Snips let you save a specific section of a track (start time to end time) and loop it infinitely. Great for replaying a favorite chorus, studying a musical passage, or skipping long intros.

### Can I use multiple audio effects at once?

Yes. The EQ, Reverb, and MS Processor all work together. You can save combined configurations as audio presets (up to 5) and switch between them with keyboard shortcuts.

### Do my settings persist?

Yes. All settings (snips, blocked tracks, speed preferences, audio presets) are saved in your browser's extension storage and persist across sessions.

### Can I transfer my settings to another browser?

Currently, settings are stored locally per browser. Cross-browser sync is not yet available.

## Privacy & Security

### Does Chorus collect any data?

No. Chorus does not collect, transmit, or store any personal data. Everything is stored locally in your browser's extension storage.

### What permissions does Chorus need and why?

| Permission | Why |
|-----------|-----|
| `storage` | Save your settings, snips, and blocked tracks |
| `activeTab` / `tabs` | Detect when Spotify is open |
| `scripting` | Inject Chorus controls into the Spotify page |
| `unlimitedStorage` | Store all your preferences without limits |
| `webRequest` | Intercept requests for device ID extraction |
| `notifications` (optional) | Show track change notifications |

### Is the source code available?

Yes. Chorus is fully open source: [github.com/chorus-studio/chorus](https://github.com/chorus-studio/chorus)

## Troubleshooting

### Chorus controls don't appear on Spotify

1. Make sure you're on [open.spotify.com](https://open.spotify.com) (not the desktop app)
2. Check that the extension is enabled in your browser's extension settings
3. Try refreshing the Spotify page
4. If the issue persists, try disabling and re-enabling the extension

### Audio effects aren't working

1. Make sure a track is playing (effects only apply during playback)
2. Check that the specific effect (EQ/Reverb/MS) is toggled on
3. Try refreshing the Spotify page
4. Some effects may not work in incognito/private browsing mode

### The Firefox version is behind the Chrome version

The Firefox version is occasionally behind due to manual publishing. You can always get the latest version from [GitHub Releases](https://github.com/chorus-studio/chorus/releases).
