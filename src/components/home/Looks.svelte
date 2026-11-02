<script lang="ts">
    import { onMount } from 'svelte'
    import Pause from '@lucide/svelte/icons/pause'
    import { autoplay, prefersReducedMotion, visibility } from '../../lib/motion'

    let { showPro = true }: { showPro?: boolean } = $props()

    const CYCLE_MS = 4500

    type Palette = { label: string; text: string; main: string; card: string; button: string }
    type Look = {
        name: string
        kind: 'gradient' | 'video' | 'cover'
        gtype?: string
        kindLabel: string
        palette: string
        source: string
        origin: string
        dim: number
        /** Roughly the backdrop's average colour, for the legibility check. */
        avg: string
        bg?: string
        thumb?: string
        stops?: string[]
        sliders?: { label: string; pct: number; value: string }[]
    }

    // Colours from the extension's built-in palettes.
    const PALETTES: Record<string, Palette> = {
        synthwave: { label: 'Synthwave', text: '#f5e1ff', main: '#1a0b2e', card: '#2a1247', button: '#ff6ec7' },
        lagoon: { label: 'Lagoon', text: '#d5f5f1', main: '#0b2f2e', card: '#124443', button: '#5eead4' },
        cover: { label: 'From the cover', text: '#f3f7f5', main: '#0f2e2b', card: '#164a45', button: '#e9c46a' },
        midnight: { label: 'Midnight', text: '#dbe7ff', main: '#0f1a2e', card: '#1b2a46', button: '#8fb8ff' },
        cherry_blossom: { label: 'Cherry blossom', text: '#ffe8ee', main: '#a22c5f', card: '#86244e', button: '#ffd4de' },
        espresso: { label: 'Espresso', text: '#f3e3d3', main: '#2b1a12', card: '#3d281d', button: '#d9a066' },
        citrus: { label: 'Citrus', text: '#ffffff', main: '#c64e00', card: '#a84200', button: '#ffde98' },
        wine: { label: 'Wine', text: '#f6dfe6', main: '#33101c', card: '#4a1829', button: '#e3a2b8' },
        matcha: { label: 'Matcha', text: '#f3fce5', main: '#3b7b2f', card: '#2f6326', button: '#c5f6a3' },
        ocean: { label: 'Ocean', text: '#c8faf3', main: '#00587a', card: '#00698f', button: '#9bf3f3' },
        desert: { label: 'Desert', text: '#fddc95', main: '#5a2e0c', card: '#874219', button: '#fbb74a' }
    }
    const SWATCHES = ['synthwave', 'lagoon', 'midnight', 'cherry_blossom', 'espresso', 'citrus', 'wine', 'matcha', 'ocean', 'desert']

    const LOOKS: Look[] = [
        {
            name: 'Neon loop',
            kind: 'video',
            kindLabel: 'Picture · video loop',
            palette: 'synthwave',
            source: 'Built-in',
            origin: 'your look',
            dim: 0.15,
            avg: '#6a4ad0',
            thumb: 'linear-gradient(120deg, #3b82f6, #7b2ff7, #ff6ec7)',
            sliders: [
                { label: 'Dim', pct: 19, value: '15%' },
                { label: 'Blur', pct: 0, value: '0 px' },
                { label: 'Saturate', pct: 60, value: '120%' }
            ]
        },
        {
            name: 'Lagoon',
            kind: 'gradient',
            gtype: 'radial',
            kindLabel: 'Gradient · radial',
            palette: 'lagoon',
            source: 'Backdrop',
            origin: 'built-in · remix',
            dim: 0,
            avg: '#1f6b63',
            bg: 'radial-gradient(ellipse at 20% 0%, #5eead4 0%, #124443 45%, #0b2f2e 100%)',
            stops: ['#5eead4', '#124443', '#0b2f2e']
        },
        {
            name: 'Album cover',
            kind: 'cover',
            kindLabel: 'Cover · follows the music',
            palette: 'cover',
            source: 'Cover',
            origin: 'your look',
            dim: 0.25,
            avg: '#3a6a52',
            thumb: 'radial-gradient(circle at 85% 85%, #e9c46a 0 32%, #1b6b63 33%)',
            sliders: [
                { label: 'Blur', pct: 80, value: '32 px' },
                { label: 'Dim', pct: 44, value: '35%' },
                { label: 'Zoom', pct: 67, value: '140%' }
            ]
        },
        {
            name: 'Midnight rings',
            kind: 'gradient',
            gtype: 'radial',
            kindLabel: 'Gradient · rings',
            palette: 'midnight',
            source: 'Built-in',
            origin: 'built-in · remix',
            dim: 0,
            avg: '#142240',
            bg: 'repeating-radial-gradient(circle at 85% 110%, #24365a 0 3px, #0f1a2e 3px 26px, #1b2a46 26px 30px, #0f1a2e 30px 52px)',
            stops: ['#24365a', '#0f1a2e', '#1b2a46']
        },
        {
            name: 'Cherry blossom',
            kind: 'gradient',
            gtype: 'linear',
            kindLabel: 'Gradient · linear',
            palette: 'cherry_blossom',
            source: 'Built-in',
            origin: 'built-in',
            dim: 0,
            avg: '#d97a9e',
            bg: 'linear-gradient(135deg, #ffd4de 0%, #e26d9a 45%, #a22c5f 100%)',
            stops: ['#ffd4de', '#e26d9a', '#a22c5f']
        },
        {
            name: 'Espresso',
            kind: 'gradient',
            gtype: 'mesh',
            kindLabel: 'Gradient · mesh',
            palette: 'espresso',
            source: 'Two colours',
            origin: 'your look',
            dim: 0,
            avg: '#4a2e20',
            bg: 'radial-gradient(at 15% 20%, #d9a066 0, transparent 45%), radial-gradient(at 85% 25%, #8a5634 0, transparent 50%), radial-gradient(at 55% 100%, #4a2e20 0, transparent 60%), #2b1a12',
            stops: ['#d9a066', '#8a5634', '#2b1a12']
        }
    ]
    const ROWS = [
        ['Afterglow', '3:41'],
        ['Static Bloom', '3:18'],
        ['Slow Tide', '4:12'],
        ['Paper Moons', '3:56']
    ]
    const TABS = [
        ['backdrop', 'Backdrop'],
        ['palette', 'Palette'],
        ['panels', 'Panels']
    ] as const
    const FEATURES = [
        ['Video wallpapers', 'MP4, WebM or animated GIF behind the page, with dim, blur and saturation.'],
        ['Colours from the music', 'Read the palette from the playing cover, so the page changes track by track.'],
        ['Two colours, whole theme', 'Pick a base and an accent and Chorus fills all fifteen slots. Or set every slot by hand.'],
        ['A legibility check', 'The editor tells you when text gets hard to read, before you save.']
    ]

    let lookIndex = $state(0)
    let paletteKey = $state<string | null>(null)
    let tab = $state<(typeof TABS)[number][0]>('backdrop')
    let show = $state(35)
    let glass = $state(true)
    let auto = $state(true)
    let visible = $state(false)

    const look = $derived(LOOKS[lookIndex])
    const activePalette = $derived(paletteKey ?? look.palette)
    const pal = $derived(PALETTES[activePalette])

    const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    const rgba = (hex: string, alpha: number) => `rgba(${channels(hex).join(',')},${alpha})`
    const luminance = (hex: string) => {
        const [r, g, b] = channels(hex).map((v) => {
            v /= 255
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const contrast = (a: string, b: string) => {
        const [x, y] = [luminance(a), luminance(b)]
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
    }
    const mix = (a: string, b: string, t: number) =>
        '#' +
        channels(a)
            .map((v, i) => Math.round(v * (1 - t) + channels(b)[i] * t).toString(16).padStart(2, '0'))
            .join('')

    // What text sits on: the panel colour with the backdrop showing through it (glass softens it).
    const ratio = $derived(contrast(pal.text, mix(pal.card, look.avg, (show / 100) * (glass ? 0.6 : 1))))
    const panelBg = $derived(rgba(pal.card, (100 - show) / 100))
    const blur = $derived(glass ? 'blur(18px) saturate(140%)' : 'none')

    function choose(patch: () => void) {
        auto = false
        patch()
    }

    onMount(() => {
        if (prefersReducedMotion()) return
        const timer = setInterval(() => {
            if (!auto || !visible) return
            lookIndex = (lookIndex + 1) % LOOKS.length
            paletteKey = null
        }, CYCLE_MS)
        return () => clearInterval(timer)
    })
</script>

{#snippet chip(label: string, on: boolean)}
    <span
        class="rounded-[7px] border py-1.75 text-center {on ? 'border-host bg-white/6 text-white' : 'border-white/10 text-[#8a8a8a]'}"
        >{label}</span
    >
{/snippet}

<section
    id="looks"
    aria-label="Looks, a Pro feature"
    class="relative scroll-mt-20 overflow-hidden bg-[#0b0b0b] px-6 py-26"
    {@attach visibility((v) => (visible = v))}
>
    <div
        aria-hidden="true"
        class="pointer-events-none absolute top-0 left-1/2 -ml-137.5 h-175 w-275 rounded-full opacity-55 transition-[background] duration-1000"
        style:background="radial-gradient(closest-side, {rgba(pal.button, 0.35)}, transparent)"
    ></div>

    <div class="relative mx-auto flex max-w-300 flex-col gap-10">
        <div class="flex flex-wrap items-end justify-between gap-6">
            <div class="flex max-w-160 flex-col gap-4">
                <div class="flex items-center gap-3">
                    {#if showPro}
                        <span class="inline-flex rounded-full bg-[linear-gradient(90deg,#ff6ec7,#8fb8ff,#5eead4,#e9c46a)] p-px">
                            <span class="rounded-full bg-[#0b0b0b] px-3 py-1.25">
                                <span
                                    class="bg-[linear-gradient(90deg,#ff6ec7,#8fb8ff,#5eead4,#e9c46a)] bg-clip-text font-code text-xs font-bold tracking-[0.2em] text-transparent"
                                    >PRO</span
                                >
                            </span>
                        </span>
                    {/if}
                    <span class="font-code text-xs tracking-[0.2em] text-host">LOOKS · THEMING</span>
                </div>
                <h2 class="m-0 font-display text-[clamp(38px,5.4vw,68px)] leading-[0.98] font-bold tracking-[-0.035em]">
                    Make the player yours.
                </h2>
                <p class="m-0 text-lg leading-relaxed text-[#b3b3b3]">
                    Put a gradient, a picture, a video loop or the album cover behind the whole page. Pick from 24 palettes or
                    build one from two colours, then let the backdrop show through glass panels.
                </p>
            </div>
            <span class="font-code text-xs text-[#8a8a8a]">Now showing: <span class="text-white">{look.name}</span></span>
        </div>

        <div class="flex flex-wrap items-stretch gap-5">
            <div
                class="relative aspect-16/10 min-w-0 flex-[1.7_1_560px] overflow-hidden rounded-[20px] border border-white/12 bg-black shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
            >
                {#each LOOKS as item, i (item.name)}
                    <div aria-hidden="true" class="absolute inset-0 transition-opacity duration-900" style:opacity={i === lookIndex ? 1 : 0}>
                        {#if item.kind === 'gradient'}
                            <div class="absolute inset-0" style:background={item.bg}></div>
                        {:else if item.kind === 'video'}
                            <video src="/media/neon-loop.mp4" loop muted playsinline class="absolute inset-0 size-full object-cover" {@attach autoplay}></video>
                        {:else}
                            <div class="absolute -inset-[10%] scale-[1.4] bg-[#1b6b63] blur-[36px]">
                                <div class="absolute right-[8%] bottom-[4%] h-[70%] w-[46%] rounded-full bg-[#e9c46a]"></div>
                            </div>
                        {/if}
                        <div class="absolute inset-0" style:background="rgba(0,0,0,{item.dim})"></div>
                    </div>
                {/each}

                <div
                    class="absolute inset-0 grid grid-cols-[minmax(0,1fr)_minmax(0,3.2fr)] grid-rows-[minmax(0,1fr)_auto] gap-2.5 p-3 transition-colors duration-700"
                    style:color={pal.text}
                >
                    <div
                        class="flex flex-col gap-3 rounded-xl p-3.5 transition-[background-color] duration-700"
                        style:background-color={panelBg}
                        style:backdrop-filter={blur}
                        style:-webkit-backdrop-filter={blur}
                    >
                        <span class="text-xs font-bold">Home</span>
                        <span class="text-xs font-bold opacity-70">Search</span>
                        <span class="text-xs font-bold opacity-70">Library</span>
                        <div class="mt-1.5 flex flex-col gap-2.25">
                            {#each [80, 64, 72, 54] as width (width)}
                                <span class="h-1.75 rounded opacity-35" style:width="{width}%" style:background={pal.text}></span>
                            {/each}
                        </div>
                    </div>
                    <div
                        class="flex flex-col gap-3 overflow-hidden rounded-xl p-4.5 transition-[background-color] duration-700"
                        style:background-color={panelBg}
                        style:backdrop-filter={blur}
                        style:-webkit-backdrop-filter={blur}
                    >
                        <div class="flex items-end gap-3.5">
                            <div class="size-17.5 shrink-0 rounded-lg transition-colors duration-700" style:background={pal.button}></div>
                            <div class="flex min-w-0 flex-col gap-1">
                                <span class="text-[10px] opacity-75">Playlist</span>
                                <span class="font-display text-[clamp(18px,2.6vw,30px)] font-bold tracking-[-0.02em]">Late night drive</span>
                            </div>
                        </div>
                        {#each ROWS as [title, len], i (title)}
                            <div
                                class="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors duration-700"
                                style:background={i === 0 ? rgba(pal.button, 0.22) : 'transparent'}
                            >
                                <span class="size-5.5 shrink-0 rounded" style:background={pal.button} style:opacity={i === 0 ? 1 : 0.45}></span>
                                <span class="min-w-0 flex-1 text-xs font-semibold">{title}</span>
                                <span class="font-code text-[10px] opacity-70">{len}</span>
                            </div>
                        {/each}
                    </div>
                    <div
                        class="col-span-full flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-[background-color] duration-700"
                        style:background-color={panelBg}
                        style:backdrop-filter={blur}
                        style:-webkit-backdrop-filter={blur}
                    >
                        <span class="size-8.5 shrink-0 rounded-md opacity-85" style:background={pal.button}></span>
                        <div class="flex min-w-0 flex-[0_1_140px] flex-col gap-0.5">
                            <span class="text-xs font-semibold">Afterglow</span>
                            <span class="text-[10px] opacity-70">Neon Harbor</span>
                        </div>
                        <div class="flex flex-1 flex-col items-center gap-1.5">
                            <span class="inline-flex size-6.5 items-center justify-center rounded-full" style:background={pal.text}>
                                <Pause size={10} fill={pal.main} stroke={pal.main} />
                            </span>
                            <span class="h-0.75 w-full max-w-90 rounded-sm bg-white/18">
                                <span class="block h-0.75 w-[42%] rounded-sm transition-colors duration-700" style:background={pal.button}></span>
                            </span>
                        </div>
                        <span class="hidden font-code text-[10px] opacity-80 sm:inline">{look.kindLabel}</span>
                    </div>
                </div>
            </div>

            <div
                class="flex min-w-0 flex-[1_1_340px] flex-col rounded-[20px] border border-white/12 bg-[#161618]/78 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-[20px]"
            >
                <div class="flex flex-col gap-3 border-b border-white/8 px-4.5 pt-4 pb-3">
                    <div class="flex items-center justify-between gap-2.5">
                        <span class="font-display text-[17px] font-bold">Look editor</span>
                        <span class="font-code text-[11px] text-[#8a8a8a]">{look.origin}</span>
                    </div>
                    <span class="rounded-[9px] border border-white/10 bg-[#0d0d0e] px-3 py-2.25 text-sm">{look.name}</span>
                    <div role="tablist" aria-label="Look editor sections" class="grid grid-cols-3 gap-0.75 rounded-[10px] bg-[#0d0d0e] p-0.75">
                        {#each TABS as [id, label] (id)}
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === id}
                                onclick={() => (tab = id)}
                                class="min-h-9 rounded-lg text-[13px] font-semibold {tab === id ? 'bg-[#2a2a2a] text-white' : 'text-[#8a8a8a] hover:text-white'}"
                                >{label}</button
                            >
                        {/each}
                    </div>
                </div>

                <div class="flex flex-1 flex-col gap-3.5 px-4.5 py-4 text-[13px]">
                    {#if tab === 'backdrop'}
                        <div class="flex flex-col gap-2">
                            <span class="font-code text-[10px] tracking-[0.15em] text-[#8a8a8a]">KIND</span>
                            <div class="grid grid-cols-3 gap-1">
                                {@render chip('Gradient', look.kind === 'gradient')}
                                {@render chip('Picture', look.kind === 'video')}
                                {@render chip('Cover', look.kind === 'cover')}
                            </div>
                        </div>
                        {#if look.kind === 'gradient'}
                            <div class="flex flex-col gap-2">
                                <span class="font-code text-[10px] tracking-[0.15em] text-[#8a8a8a]">GRADIENT</span>
                                <div class="flex flex-wrap gap-1">
                                    {#each ['linear', 'radial', 'conic', 'mesh'] as type (type)}
                                        <span
                                            class="rounded-full border px-2.5 py-1.25 {type === look.gtype
                                                ? 'border-host text-white'
                                                : 'border-white/10 text-[#8a8a8a]'}">{type}</span
                                        >
                                    {/each}
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="w-16 font-code text-[10px] tracking-[0.15em] text-[#8a8a8a]">STOPS</span>
                                {#each look.stops ?? [] as stop (stop)}
                                    <span class="size-6 rounded-full border-2 border-white/80" style:background={stop}></span>
                                {/each}
                            </div>
                            <div class="flex items-center justify-between">
                                <span>Drift</span>
                                <span class="inline-flex h-5 w-8.5 justify-end rounded-full bg-host p-0.5"><span class="size-4 rounded-full bg-white"></span></span>
                            </div>
                        {:else if look.kind === 'video'}
                            <span class="flex items-center gap-2.5 rounded-[9px] border border-white/10 bg-[#0d0d0e] px-2.5 py-2">
                                <span class="h-6 w-9 rounded bg-[linear-gradient(120deg,#3b82f6,#7b2ff7,#ff6ec7)]"></span>
                                <span class="flex flex-col">
                                    <span>neon-loop.mp4</span>
                                    <span class="font-code text-[10px] text-[#8a8a8a]">video · 10 s loop</span>
                                </span>
                            </span>
                        {:else}
                            <span class="leading-normal text-[#b3b3b3]">The playing cover, blurred and enlarged. It changes with every track.</span>
                        {/if}
                        {#each look.sliders ?? [] as slider (slider.label)}
                            <div class="flex items-center gap-2.5">
                                <span class="w-16">{slider.label}</span>
                                <span class="h-1 flex-1 rounded-sm bg-[#2a2a2a]">
                                    <span class="block h-1 rounded-sm bg-host" style:width="{slider.pct}%"></span>
                                </span>
                                <span class="w-12 text-right font-code text-[11px] text-[#b3b3b3]">{slider.value}</span>
                            </div>
                        {/each}
                    {:else if tab === 'palette'}
                        <div class="flex flex-col gap-2">
                            <span class="font-code text-[10px] tracking-[0.15em] text-[#8a8a8a]">SOURCE</span>
                            <div class="grid grid-cols-2 gap-1">
                                {#each ['Built-in', 'Two colours', 'Cover', 'Backdrop'] as source (source)}
                                    {@render chip(source, paletteKey ? source === 'Built-in' : source === look.source)}
                                {/each}
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="font-code text-[10px] tracking-[0.15em] text-[#8a8a8a]">BUILT-IN · 24</span>
                            <div class="grid grid-cols-5 gap-1.5">
                                {#each SWATCHES as key (key)}
                                    {@const swatch = PALETTES[key]}
                                    <button
                                        type="button"
                                        aria-label="{swatch.label} palette"
                                        aria-pressed={key === activePalette}
                                        onclick={() => choose(() => (paletteKey = key))}
                                        class="aspect-square rounded-[10px] border-2 {key === activePalette ? 'border-white' : 'border-transparent'}"
                                        style:background="linear-gradient(135deg, {swatch.main} 0 55%, {swatch.button} 55% 100%)"
                                    ></button>
                                {/each}
                            </div>
                        </div>
                    {:else}
                        <label class="flex flex-col gap-2.5">
                            <span class="flex justify-between">
                                <span>Show-through</span><span class="font-code text-[#b3b3b3]">{show}%</span>
                            </span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={show}
                                oninput={(event) => choose(() => (show = Number(event.currentTarget.value)))}
                                class="w-full accent-host"
                            />
                        </label>
                        <div class="flex items-center justify-between">
                            <span id="glass-label">Glass</span>
                            <button
                                type="button"
                                aria-labelledby="glass-label"
                                aria-pressed={glass}
                                onclick={() => choose(() => (glass = !glass))}
                                class="inline-flex h-6.5 w-11 rounded-full p-0.75 transition-colors duration-200 {glass
                                    ? 'justify-end bg-host'
                                    : 'justify-start bg-[#3a3a3a]'}"
                            >
                                <span class="size-5 rounded-full bg-white"></span>
                            </button>
                        </div>
                        <span class="leading-normal text-[#8a8a8a]">
                            Panels go all the way to clear. Glass blurs the backdrop behind each one so text stays readable.
                        </span>
                    {/if}
                </div>

                <div class="flex flex-wrap items-center gap-2.5 border-t border-white/8 px-4.5 py-3">
                    <span class="inline-flex items-center gap-2 text-xs text-[#dcdcdc]">
                        <span class="size-2 rounded-full {ratio >= 4.5 ? 'bg-[#1ed760]' : 'bg-[#ffa42b]'}"></span>
                        Text {ratio.toFixed(1)}:1 · {ratio >= 4.5 ? 'easy to read' : 'hard to read'}
                    </span>
                    <span class="ml-auto px-3 py-2 text-[13px] text-[#b3b3b3]">Cancel</span>
                    <span class="rounded-lg bg-host-strong px-3.5 py-2 text-[13px] font-semibold text-host-ink">Save look</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
            {#each LOOKS as item, i (item.name)}
                {@const on = i === lookIndex}
                <button
                    type="button"
                    aria-pressed={on}
                    onclick={() => choose(() => ((lookIndex = i), (paletteKey = null)))}
                    class="flex flex-col gap-2.5 rounded-[14px] border bg-[#121212] px-2 pt-2 pb-3 text-left transition-[border-color,translate] duration-300 {on
                        ? '-translate-y-1 border-host'
                        : 'border-white/8 hover:border-white/20'}"
                >
                    <span class="relative block h-18 overflow-hidden rounded-[9px]" style:background={item.thumb ?? item.bg}>
                        <span class="absolute bottom-2 left-2 flex gap-1">
                            <span class="size-3 rounded-full border border-white/60" style:background={PALETTES[item.palette].main}></span>
                            <span class="size-3 rounded-full border border-white/60" style:background={PALETTES[item.palette].button}></span>
                        </span>
                    </span>
                    <span class="flex flex-col gap-0.5 px-1">
                        <span class="text-sm font-semibold">{item.name}</span>
                        <span class="font-code text-[10px] text-[#8a8a8a]">{item.kindLabel}</span>
                    </span>
                </button>
            {/each}
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
            {#each FEATURES as [title, body] (title)}
                <div class="flex flex-col gap-2 rounded-2xl border border-white/7 bg-[#121212] p-5">
                    <span class="font-display text-lg font-bold">{title}</span>
                    <span class="text-sm leading-normal text-[#a8a8a8]">{body}</span>
                </div>
            {/each}
        </div>
    </div>
</section>
