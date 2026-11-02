<script lang="ts">
    import { onMount } from 'svelte'
    import { useHost } from '../../lib/host.svelte'
    import { autoplay, prefersReducedMotion, visibility } from '../../lib/motion'

    const ADVANCE_MS = 6500

    const host = useHost()

    const tabs = [
        {
            title: 'Snips',
            body: 'Drag two handles around the part you love. Play it once, three times, or forever, or skip that part every time.',
            clip: 'snip'
        },
        {
            title: 'Speed, pitch and key',
            body: 'Practise a solo at half speed without the chipmunk effect. Shift the key to fit your voice.',
            clip: 'speed'
        },
        {
            title: 'EQ and reverb',
            body: 'Ten bands with presets you can save, and rooms from a small studio to a cathedral.',
            clip: 'shape'
        },
        {
            title: 'Vocal separation',
            body: 'Instrumentals for karaoke, acapellas for the voice alone. In the tab, on Chrome, nothing uploaded.',
            clip: 'vocals'
        },
        {
            title: 'Auto-skip and block',
            body: 'Block a track from any view, or skip by keyword: remixes, sped-up edits, live cuts, a whole artist.',
            clip: 'skip'
        }
    ]

    let active = $state(0)
    let visible = $state(false)
    let timer: ReturnType<typeof setInterval> | undefined

    const src = $derived(`/media/${tabs[active].clip}${host.current === 'youtube' ? '-yt' : ''}.mp4`)

    function restart() {
        clearInterval(timer)
        if (prefersReducedMotion()) return
        timer = setInterval(() => {
            if (visible) active = (active + 1) % tabs.length
        }, ADVANCE_MS)
    }

    function pick(index: number) {
        active = index
        restart()
    }

    onMount(() => {
        restart()
        return () => clearInterval(timer)
    })
</script>

<section
    id="showcase"
    class="relative mx-auto flex max-w-290 scroll-mt-24 flex-col gap-11 px-6 pt-18 pb-24"
    {@attach visibility((v) => (visible = v))}
>
    <div class="reveal flex max-w-160 flex-col gap-3.5">
        <span class="font-code text-xs tracking-[0.2em] text-host">SEE IT WORK</span>
        <h2 class="m-0 font-display text-[clamp(34px,4.6vw,56px)] leading-none font-bold tracking-[-0.03em]">
            Five things your player can't do. Yet.
        </h2>
    </div>
    <div class="flex flex-wrap items-start gap-7">
        <div role="tablist" aria-label="Features" class="flex min-w-0 flex-[1_1_340px] flex-col gap-1.5">
            {#each tabs as tab, i (tab.title)}
                {@const on = i === active}
                <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onclick={() => pick(i)}
                    class="relative flex flex-col gap-2 overflow-hidden rounded-2xl border px-5 py-4.5 text-left transition-[translate,background-color] duration-200 hover:-translate-y-0.5 {on
                        ? 'border-white/12 bg-[#151515]'
                        : 'border-transparent'}"
                >
                    <span class="flex items-center gap-3">
                        <span class="font-code text-xs {on ? 'text-host' : 'text-[#5f5f5f]'}">0{i + 1}</span>
                        <span class="font-display text-xl font-bold {on ? 'text-white' : 'text-[#8a8a8a]'}">{tab.title}</span>
                    </span>
                    {#if on}
                        <span class="animate-[enter_.45s_ease_both] text-[15px] leading-relaxed text-[#b3b3b3]">{tab.body}</span>
                        <span class="absolute inset-x-0 bottom-0 h-0.5 bg-white/6">
                            {#key active}
                                <span class="block h-0.5 origin-left animate-[fill_6.5s_linear_both] bg-host"></span>
                            {/key}
                        </span>
                    {/if}
                </button>
            {/each}
        </div>
        <div class="sticky top-24 min-w-0 flex-[1.6_1_520px]">
            <div
                class="relative rounded-[22px] p-px"
                style="background: linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 40%, color-mix(in srgb, var(--host) 16%, transparent))"
            >
                <div class="relative flex aspect-16/11 items-center justify-center overflow-hidden rounded-[21px] bg-[#0b0b0b]">
                    <div
                        aria-hidden="true"
                        class="absolute inset-0"
                        style="background: radial-gradient(ellipse at 70% 0%, color-mix(in srgb, var(--host) 16%, transparent), transparent 60%)"
                    ></div>
                    {#key src}
                        <video
                            {src}
                            loop
                            muted
                            playsinline
                            aria-label="{tabs[active].title}, recorded in Chorus"
                            class="relative block max-h-[92%] max-w-[94%] animate-[enter_.5s_ease_both]"
                            {@attach autoplay}
                        ></video>
                    {/key}
                </div>
            </div>
        </div>
    </div>
</section>
