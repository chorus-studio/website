<script lang="ts">
    import { useHost, type Host } from '../../lib/host.svelte'
    import { autoplay } from '../../lib/motion'

    let {
        sources,
        label,
        class: className = ''
    }: { sources: Record<Host, string>; label: string; class?: string } = $props()

    const host = useHost()
    const src = $derived(sources[host.current])
</script>

{#key src}
    <video {src} loop muted playsinline aria-label={label} class={className} {@attach autoplay}></video>
{/key}
