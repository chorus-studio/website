<script lang="ts">
    import { setHost, useHost, type Host } from '../../lib/host.svelte'

    const host = useHost()

    const options: { id: Host; label: string; dot: string }[] = [
        { id: 'spotify', label: 'Spotify', dot: '#1ed760' },
        { id: 'youtube', label: 'YouTube', dot: '#ff0033' }
    ]
</script>

<div
    role="group"
    aria-label="Choose your player"
    class="inline-flex flex-wrap gap-1 self-start rounded-[14px] border border-white/10 bg-white/5 p-1"
>
    {#each options as option (option.id)}
        {@const on = host.current === option.id}
        <button
            type="button"
            aria-pressed={on}
            onclick={() => setHost(option.id)}
            class="inline-flex min-h-11 items-center gap-2.5 rounded-[10px] px-4.5 text-[15px] font-semibold transition-colors duration-200 {on
                ? 'bg-white text-[#0b0b0b]'
                : 'text-[#b3b3b3] hover:text-white'}"
        >
            <span class="size-2.25 rounded-full" style:background={option.dot}></span>
            {option.label}
        </button>
    {/each}
</div>
