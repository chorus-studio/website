export const LINKS = {
    chrome: 'https://chromewebstore.google.com/detail/chorus-spotify-enhancer/jfnjmnapkhdbaidedlbdcmhiphfjljcd',
    firefox: 'https://addons.mozilla.org/firefox/addon/chorus-spotify-enhancer/',
    releases: 'https://github.com/chorus-studio/chorus/releases',
    github: 'https://github.com/chorus-studio/chorus',
    discord: 'https://discord.gg/6nwYZsBw8G',
    kofi: 'https://ko-fi.com/cdrani',
    docs: '/getting-started/installation/',
    issues: 'https://github.com/chorus-studio/chorus-dev/issues'
}

/** Chorus for YouTube isn't in a store yet; early builds go out through the Discord. */
export const YOUTUBE_EARLY_ACCESS = LINKS.discord

/** The /support form's topics; functions/api/support.ts accepts only these. */
export const SUPPORT_TOPICS = ['Bug report', 'Feature request', 'Setup help', 'Chorus Pro and licenses', 'General question']
