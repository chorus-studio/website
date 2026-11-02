import { onMount } from 'svelte'

export type Host = 'spotify' | 'youtube'

const STORAGE_KEY = 'chorus-host'

/** The player the page is showing, shared by every island on it. */
export const site = $state<{ host: Host }>({ host: 'spotify' })

/** Pick up the host the head script put on <html> (from ?host= or a past visit). */
function syncHost() {
    site.host = document.documentElement.dataset.host === 'youtube' ? 'youtube' : 'spotify'
}

export function setHost(host: Host) {
    site.host = host
    document.documentElement.dataset.host = host
    try {
        localStorage.setItem(STORAGE_KEY, host)
    } catch {
        // Private windows can refuse storage; the switch still works for this visit.
    }
}

/**
 * The host for a component to render with. It reads 'spotify' until the component mounts, so
 * hydration matches the server-rendered markup, then follows the shared state.
 * Call during component initialisation.
 */
export function useHost() {
    let mounted = $state(false)
    onMount(() => {
        syncHost()
        mounted = true
    })
    return {
        get current(): Host {
            return mounted ? site.host : 'spotify'
        }
    }
}
