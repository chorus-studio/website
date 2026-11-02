<script lang="ts">
    import Play from '@lucide/svelte/icons/play'
    import { useHost } from '../../lib/host.svelte'

    const CHAPTERS = [
        { at: 8, label: 'Inside the player' },
        { at: 13, label: 'Snips' },
        { at: 20, label: 'Speed and key' },
        { at: 26, label: 'EQ and reverb' },
        { at: 32, label: 'Vocals' },
        { at: 37, label: 'Auto-skip' }
    ]

    const host = useHost()

    let open = $state(false)
    let video = $state<HTMLVideoElement>()
    let startAt = 0

    const stamp = (seconds: number) => `0:${String(seconds).padStart(2, '0')}`

    function play(seconds: number) {
        startAt = seconds
        if (!video) {
            open = true
            return
        }
        video.currentTime = seconds
        video.play().catch(() => {})
    }

    function start(node: HTMLVideoElement) {
        node.currentTime = startAt
        node.play().catch(() => {})
    }
</script>

<section id="tour" class="mx-auto flex max-w-290 scroll-mt-24 flex-wrap items-stretch gap-7 px-6 pt-6 pb-24">
    <div class="reveal relative aspect-video min-w-0 flex-[2.2_1_560px] overflow-hidden rounded-[22px] border border-white/10 bg-black">
        {#if open}
            <video
                bind:this={video}
                src="/media/tour.mp4"
                poster="/media/tour-poster.jpg"
                controls
                playsinline
                class="absolute inset-0 size-full"
                {@attach start}
            ></video>
        {:else}
            <img src="/media/tour-poster.jpg" alt="Chorus promo video" class="absolute inset-0 size-full object-cover" />
            <button
                type="button"
                onclick={() => play(0)}
                aria-label="Play the 50-second tour"
                class="absolute top-1/2 left-1/2 -mt-10.5 -ml-10.5 flex size-21 animate-[pulse-ring_1.8s_ease-out_infinite] items-center justify-center rounded-full border border-white/30 bg-white/12 text-white backdrop-blur-md [--pc:color-mix(in_srgb,var(--host)_35%,transparent)]"
            >
                <Play size={28} fill="currentColor" />
            </button>
        {/if}
    </div>
    <div class="reveal flex flex-[1_1_280px] flex-col gap-1.5">
        <span class="font-code text-xs tracking-[0.2em] text-host">THE TOUR · 0:50</span>
        <h2 class="mt-1 mb-3 font-display text-[32px] leading-[1.05] font-bold tracking-[-0.02em]">Jump to a chapter.</h2>
        {#each CHAPTERS as chapter (chapter.at)}
            <button
                type="button"
                onclick={() => play(chapter.at)}
                class="flex min-h-12 items-center gap-3.5 rounded-xl border border-white/7 bg-[#121212] px-3.5 text-left text-[15px] transition-[translate,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/15"
            >
                <span class="font-code text-xs text-host">{stamp(chapter.at)}</span>{chapter.label}
            </button>
        {/each}
        <span class="mt-2 text-[13px] text-[#7f7f7f]">
            {host.current === 'youtube' ? 'Spotify edition. A YouTube edition is on the way.' : 'Spotify edition.'}
        </span>
    </div>
</section>
