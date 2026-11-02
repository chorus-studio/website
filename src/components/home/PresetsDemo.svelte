<script lang="ts">
    import { onMount } from 'svelte'
    import Waves from '@lucide/svelte/icons/waves'
    import Zap from '@lucide/svelte/icons/zap'
    import FastForward from '@lucide/svelte/icons/fast-forward'
    import Moon from '@lucide/svelte/icons/moon'
    import Disc from '@lucide/svelte/icons/disc'
    import CassetteTape from '@lucide/svelte/icons/cassette-tape'
    import BookOpen from '@lucide/svelte/icons/book-open'
    import CloudRain from '@lucide/svelte/icons/cloud-rain'
    import Sparkles from '@lucide/svelte/icons/sparkles'
    import Mic from '@lucide/svelte/icons/mic'
    import Building from '@lucide/svelte/icons/building'
    import Droplets from '@lucide/svelte/icons/droplets'
    import TrainFront from '@lucide/svelte/icons/train-front'
    import Wind from '@lucide/svelte/icons/wind'
    import CarFront from '@lucide/svelte/icons/car-front'
    import Gauge from '@lucide/svelte/icons/gauge'
    import Scissors from '@lucide/svelte/icons/scissors'
    import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal'
    import MoveHorizontal from '@lucide/svelte/icons/move-horizontal'
    import Settings from '@lucide/svelte/icons/settings'
    import Pin from '@lucide/svelte/icons/pin'
    import Power from '@lucide/svelte/icons/power'
    import Star from '@lucide/svelte/icons/star'
    import Play from '@lucide/svelte/icons/play'
    import ChorusMark from '../ChorusMark.svelte'
    import { useHost } from '../../lib/host.svelte'
    import { prefersReducedMotion, visibility } from '../../lib/motion'

    type Group = 'vibes' | 'lofi' | 'spaces' | 'tools' | 'mine'
    type Preset = { id: string; name: string; chips: string; icon: typeof Waves }
    type Toast = 'pin' | 'unpin' | 'added' | 'pick'
    type Frame = {
        step: number
        group: Group
        active: string | null
        track: number
        bound?: boolean
        pinPop?: boolean
        toast?: Toast
        note?: 'away' | 'back'
        slots?: number
        press?: number
    }

    const FRAME_MS = 2600
    const TICK_MS = 400

    // A few of the 61 built-ins per group, with the chips the Presets tab shows under each name.
    const PRESETS: Record<Exclude<Group, 'mine'>, Preset[]> = {
        vibes: [
            { id: 'slowed-reverb', name: 'Slowed + reverb', chips: '0.85× · hall · low-pass', icon: Waves },
            { id: 'nightcore', name: 'Nightcore', chips: '1.25× · pitch up', icon: Zap },
            { id: 'sped-up-reverb', name: 'Sped up + reverb', chips: '1.2× · hall', icon: FastForward },
            { id: 'super-slowed', name: 'Super slowed', chips: '0.7× · hall', icon: Moon },
            { id: 'slowed-bass', name: 'Slowed + bass', chips: '0.9× · bass · tape', icon: Disc },
            { id: 'chopped-screwed', name: 'Chopped & screwed', chips: '0.72× · dark · dust', icon: CassetteTape }
        ],
        lofi: [
            { id: 'lofi-cover', name: 'Lo-fi cover', chips: '0.825× · low-pass · cassette', icon: Disc },
            { id: 'classic-lofi', name: 'Classic lo-fi', chips: 'low-pass · tape · studio', icon: CassetteTape },
            { id: 'late-night-study', name: 'Late night study', chips: 'low-pass · room · −3 dB air', icon: BookOpen },
            { id: 'rainy-cafe', name: 'Rainy cafe', chips: '−6 dB air · low-pass · crackle', icon: CloudRain },
            { id: 'dreamy', name: 'Dreamy', chips: '0.94× · hall · low-pass', icon: Sparkles },
            { id: 'old-cassette', name: 'Old cassette', chips: '−7 dB air · low-pass · tape', icon: CassetteTape }
        ],
        spaces: [
            { id: 'live-show', name: 'Live show', chips: 'hall · PA grit · wide', icon: Mic },
            { id: 'stairwell', name: 'Stairwell', chips: 'slap · long tail', icon: Building },
            { id: 'swimming-pool', name: 'Swimming pool', chips: 'tile · splash · boom', icon: Droplets },
            { id: 'subway-platform', name: 'Subway platform', chips: 'tunnel · rumble', icon: TrainFront },
            { id: 'open-air', name: 'Open air', chips: 'air · wide', icon: Wind },
            { id: 'car-stereo', name: 'Car stereo', chips: 'bass up · highs rolled · narrow', icon: CarFront }
        ],
        tools: [
            { id: 'karaoke', name: 'Karaoke', chips: 'centre vocals cut', icon: Mic },
            { id: 'practice', name: 'Practice', chips: '0.75× · keep pitch', icon: Gauge },
            { id: 'transcribe', name: 'Transcribe', chips: '0.5× · keep pitch · mono', icon: BookOpen },
            { id: 'podcast', name: 'Podcast', chips: '1.5× · keep pitch · speech', icon: Mic },
            { id: 'bass-boost', name: 'Bass boost', chips: '+6 dB 90 Hz · +3 dB 250 Hz', icon: Disc },
            { id: 'quiet-hours', name: 'Quiet hours', chips: 'thump cut · late nights', icon: Moon }
        ]
    }
    const BY_ID: Record<string, Preset> = Object.fromEntries(
        Object.values(PRESETS)
            .flat()
            .map((p) => [p.id, p])
    )
    const MINE = ['slowed-reverb', 'late-night-study', 'practice', 'classic-lofi']
    const GROUPS: [Group, string][] = [
        ['vibes', 'Vibes'],
        ['lofi', 'Lo-fi'],
        ['spaces', 'Spaces'],
        ['tools', 'Tools'],
        ['mine', 'Mine']
    ]
    const RACK_TABS = [Scissors, Gauge, Waves, SlidersHorizontal, MoveHorizontal, FastForward, Moon]

    const TRACKS = [
        { title: 'Afterglow', artist: 'Neon Harbor', len: '3:41', secs: 221, cover: 'linear-gradient(135deg, #ff8a3d, #c2185b)' },
        {
            title: 'Slow Tide',
            artist: 'Mara Vale',
            len: '4:12',
            secs: 252,
            cover: 'radial-gradient(circle at 70% 75%, #e9c46a 0 30%, transparent 31%), linear-gradient(160deg, #1b6b63, #0e3b37)'
        },
        { title: 'Static Bloom', artist: 'Neon Harbor', len: '3:18', secs: 198, cover: 'linear-gradient(135deg, #6d28d9, #ff6ec7)' }
    ]
    const PINNED_ARTIST = 'Neon Harbor'

    // The loop: browse, pin to an artist, keep your own.
    const FRAMES: Frame[] = [
        { step: 0, group: 'vibes', active: null, track: 0 },
        { step: 0, group: 'vibes', active: 'slowed-reverb', track: 0 },
        { step: 0, group: 'lofi', active: 'classic-lofi', track: 0 },
        { step: 0, group: 'spaces', active: 'stairwell', track: 0 },
        { step: 1, group: 'vibes', active: 'slowed-reverb', track: 0, bound: true, pinPop: true, toast: 'pin' },
        { step: 1, group: 'vibes', active: null, track: 1, bound: true, note: 'away' },
        { step: 1, group: 'vibes', active: 'slowed-reverb', track: 2, bound: true, note: 'back' },
        { step: 2, group: 'mine', active: 'slowed-reverb', track: 2, bound: true, slots: 3 },
        { step: 2, group: 'mine', active: 'slowed-reverb', track: 2, bound: true, slots: 4, toast: 'added' },
        { step: 2, group: 'mine', active: 'late-night-study', track: 2, bound: true, slots: 4, press: 2 }
    ]

    const host = useHost()

    let frame = $state(0)
    let manual = $state<Frame | null>(null)
    let pos = $state(6)
    let jump = $state(false)
    let visible = $state(false)
    let frameTimer: ReturnType<typeof setInterval> | undefined

    const view = $derived(manual ?? FRAMES[frame])
    const youtube = $derived(host.current === 'youtube')
    const track = $derived(TRACKS[view.track])
    const active = $derived(view.active ? BY_ID[view.active] : null)
    const bound = $derived(!!view.bound && track.artist === PINNED_ARTIST)
    const slotCount = $derived(view.slots ?? 3)
    const slotsLeft = $derived(5 - slotCount)
    const readout = $derived(active ? active.chips.split(' · ') : [])
    const elapsed = $derived.by(() => {
        const secs = Math.round((track.secs * pos) / 100)
        return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
    })

    const toast = $derived.by(() => {
        switch (view.toast) {
            case 'pin':
                return `${active?.name ?? 'Slowed + reverb'} now follows ${track.artist}`
            case 'unpin':
                return `${track.artist} no longer changes the preset`
            case 'added':
                return 'Classic lo-fi added to Mine'
            case 'pick':
                return 'Pick a preset first'
            default:
                return ''
        }
    })
    const note = $derived(
        view.note === 'away'
            ? youtube
                ? 'Another channel: back to Normal'
                : 'Another artist: back to Normal'
            : view.note === 'back'
              ? `${PINNED_ARTIST} again: on by itself`
              : ''
    )
    const pinTitle = $derived(
        bound
            ? `${active?.name ?? 'A preset'} follows ${track.artist} · click to stop`
            : active
              ? `Use ${active.name} whenever ${track.artist} plays`
              : `Pick a preset, then pin it to ${track.artist}`
    )

    const steps = $derived([
        {
            title: 'Pick a sound',
            body: 'Vibes, Lo-fi, Spaces and Tools. Tap a preset to hear it, tap again to go back to normal.'
        },
        {
            title: youtube ? 'Pin it to a channel' : 'Pin it to an artist',
            body: youtube
                ? 'Videos from that channel switch to it by themselves, and what was playing before comes back after.'
                : 'Their tracks switch to it by themselves, and what was playing before comes back after.'
        },
        { title: 'Keep five of your own', body: "Star a built-in or save what's playing. Each slot gets a keyboard shortcut." }
    ])

    function rate(id: string | null) {
        const match = id ? /^([\d.]+)×/.exec(BY_ID[id]?.chips ?? '') : null
        return match ? parseFloat(match[1]) : 1
    }

    function startLoop() {
        clearInterval(frameTimer)
        if (prefersReducedMotion()) return
        frameTimer = setInterval(() => {
            if (manual || !visible) return
            const next = (frame + 1) % FRAMES.length
            if (FRAMES[next].track !== FRAMES[frame].track) {
                pos = 4
                jump = true
            }
            frame = next
        }, FRAME_MS)
    }

    function takeOver(patch: Partial<Frame>) {
        clearInterval(frameTimer)
        manual = { ...view, toast: undefined, note: undefined, pinPop: false, press: 0, ...patch }
    }

    function goToStep(step: number) {
        manual = null
        frame = FRAMES.findIndex((f) => f.step === step)
        startLoop()
    }

    function replay() {
        manual = null
        frame = 0
        pos = 4
        jump = true
        startLoop()
    }

    function togglePin() {
        if (bound) takeOver({ bound: false, toast: 'unpin' })
        else if (!active) takeOver({ toast: 'pick' })
        else takeOver({ bound: true, toast: 'pin', pinPop: true })
    }

    onMount(() => {
        if (prefersReducedMotion()) frame = 1
        startLoop()
        const tick = setInterval(() => {
            if (!visible) return
            const next = pos + 0.5 * rate(view.active)
            jump = next > 100
            pos = jump ? 0 : next
        }, TICK_MS)
        return () => {
            clearInterval(frameTimer)
            clearInterval(tick)
        }
    })
</script>

<section
    id="presets"
    aria-label="Presets"
    class="relative scroll-mt-20 overflow-hidden bg-[#0a0a0a] px-6 py-26"
    {@attach visibility((v) => (visible = v))}
>
    <div
        aria-hidden="true"
        class="pointer-events-none absolute top-10 -right-60 h-190 w-250 rounded-full transition-[background] duration-1000"
        style:background="radial-gradient(closest-side, color-mix(in srgb, var(--host) {active ? 16 : 8}%, transparent), transparent)"
    ></div>

    <div class="relative mx-auto flex max-w-290 flex-wrap items-center gap-14">
        <div class="flex min-w-0 flex-[1_1_380px] flex-col gap-5.5">
            <div class="flex items-center gap-3">
                <span class="rounded-full bg-host-strong px-2.5 py-1 text-xs font-bold text-host-ink">New</span>
                <span class="font-code text-xs tracking-[0.2em] text-host">PRESETS</span>
            </div>
            <h2 class="m-0 font-display text-[clamp(38px,5vw,62px)] leading-[0.98] font-bold tracking-[-0.035em]">
                One tap, a whole sound.
            </h2>
            <p class="m-0 max-w-117.5 text-lg leading-relaxed text-[#b3b3b3]">
                A preset sets speed, key, reverb, EQ, stereo and texture in one go. 61 come built in, from slowed + reverb to a
                subway platform.
            </p>
            <div class="flex flex-col gap-2">
                {#each steps as step, i (i)}
                    {@const on = view.step === i}
                    <button
                        type="button"
                        onclick={() => goToStep(i)}
                        aria-current={on ? 'step' : undefined}
                        class="flex gap-3.5 rounded-[14px] border px-4.5 py-4 text-left transition-colors duration-500 {on
                            ? 'border-white/12 bg-[#141414]'
                            : 'border-transparent'}"
                    >
                        <span class="pt-0.75 font-code text-xs transition-colors duration-500 {on ? 'text-host' : 'text-[#5f5f5f]'}">0{i + 1}</span>
                        <span class="flex flex-col gap-1">
                            <span class="font-display text-lg font-bold transition-colors duration-500 {on ? 'text-white' : 'text-[#8a8a8a]'}">{step.title}</span>
                            <span class="text-sm leading-normal text-[#9a9a9a]">{step.body}</span>
                        </span>
                    </button>
                {/each}
            </div>
            <div class="flex flex-wrap gap-x-6 gap-y-2 font-code text-xs text-[#7f7f7f]">
                <span><span class="text-white">61</span> built in</span>
                <span><span class="text-white">4</span> groups</span>
                <span><span class="text-white">5</span> slots of your own</span>
            </div>
        </div>

        <div class="relative min-w-0 flex-[1.25_1_540px]">
            <div
                aria-hidden="true"
                class="absolute -top-5.5 -right-3.5 z-3 inline-flex items-center gap-2 rounded-xl border border-white/12 bg-[#161616]/95 px-3.25 py-2.25 text-[13px] shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-[opacity,translate] duration-500 {note
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0'}"
            >
                <span class="size-1.75 rounded-full bg-host shadow-[0_0_10px_var(--host)]"></span>{note}
            </div>

            <div class="mb-3.5 flex flex-col gap-2 rounded-2xl border border-white/8 bg-[#141414] px-3.5 py-3">
                <div class="flex items-center gap-3.5">
                    <div class="relative size-12 shrink-0 overflow-hidden rounded-md bg-[#222]">
                        {#each TRACKS as t, i (t.title)}
                            <div
                                class="absolute inset-0 transition-opacity duration-700"
                                style:background={t.cover}
                                style:opacity={i === view.track ? 1 : 0}
                            ></div>
                        {/each}
                    </div>
                    <div class="flex min-w-0 flex-auto flex-col gap-0.75">
                        <span class="truncate text-sm font-semibold">{track.title}</span>
                        <span class="text-xs text-[#a0a0a0] underline decoration-white/25 underline-offset-[3px]">{track.artist}</span>
                    </div>
                    <div class="flex max-w-[58%] flex-wrap justify-end gap-1.25">
                        {#each readout as chip (chip)}
                            <span class="rounded-[7px] border border-host/45 bg-host/10 px-2 py-1 font-code text-[11px] whitespace-nowrap text-host">{chip}</span>
                        {:else}
                            <span class="rounded-[7px] border border-white/12 px-2 py-1 font-code text-[11px] text-[#9a9a9a]">Normal</span>
                        {/each}
                    </div>
                </div>
                <div class="flex items-center gap-2.5 font-code text-[10px] text-[#7f7f7f]">
                    <span class="w-7">{elapsed}</span>
                    <div class="h-1 flex-1 overflow-hidden rounded-sm bg-[#2a2a2a]">
                        <div
                            class="h-full rounded-sm bg-host ease-linear"
                            style:width="{pos}%"
                            style:transition-property="width"
                            style:transition-duration={jump ? '0s' : `${TICK_MS}ms`}
                        ></div>
                    </div>
                    <span>{track.len}</span>
                </div>
            </div>

            <div
                class="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#151515] shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_70px_color-mix(in_srgb,var(--host)_8%,transparent)]"
            >
                <div class="flex items-center gap-0.5 border-b border-white/7 px-3 py-2.5">
                    <ChorusMark size={22} />
                    <span class="relative mr-1 ml-2 inline-flex items-center gap-1.5 rounded-lg bg-[#262626] px-2.5 py-1.5 text-[13px] font-semibold">
                        <Sparkles size={14} />Presets
                        {#if active}<span class="absolute top-0.75 right-0.75 size-1 rounded-full bg-host"></span>{/if}
                    </span>
                    {#each RACK_TABS as Icon, i (i)}
                        {@const lit =
                            !!active && ((i === 1 && rate(view.active) !== 1) || (i === 2 && /hall|room|slap|tile|tunnel|PA/.test(active.chips)))}
                        <span class="relative inline-flex size-7.5 items-center justify-center text-[#9a9a9a]">
                            <Icon size={15} />
                            {#if lit}<span class="absolute top-1 right-1 size-1 rounded-full bg-host"></span>{/if}
                        </span>
                    {/each}
                    <span class="ml-auto inline-flex text-[#9a9a9a]"><Settings size={16} /></span>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-2.5 px-4 pt-3.5 pb-1.5">
                    <div class="flex min-w-0 items-center gap-2.5">
                        <span
                            class="size-2 rounded-full transition-[background-color,box-shadow] duration-300 {active
                                ? 'bg-host shadow-[0_0_8px_var(--host)]'
                                : 'bg-[#3a3a3a]'}"
                        ></span>
                        <span class="text-[15px] font-semibold whitespace-nowrap">{active?.name ?? 'Normal'}</span>
                        <span class="inline-flex text-[#8a8a8a]"><SlidersHorizontal size={14} /></span>
                        <button
                            type="button"
                            onclick={togglePin}
                            aria-pressed={bound}
                            aria-label={pinTitle}
                            title={pinTitle}
                            class="inline-flex size-7.5 items-center justify-center rounded-lg transition-[background-color,color,scale] duration-400 ease-[cubic-bezier(.3,1.7,.5,1)] {bound
                                ? 'bg-host/18 text-host'
                                : 'text-[#8a8a8a] hover:bg-white/5'} {view.pinPop ? 'scale-[1.18]' : 'scale-100'}"
                        >
                            <Pin size={14} fill={bound ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                    <div role="tablist" aria-label="Preset groups" class="inline-flex gap-0.5 rounded-[9px] border border-white/8 bg-[#0e0e0e] p-0.75">
                        {#each GROUPS as [id, label] (id)}
                            {@const on = view.group === id}
                            <button
                                type="button"
                                role="tab"
                                aria-selected={on}
                                onclick={() => takeOver({ group: id })}
                                class="rounded-md px-2.5 py-1.25 text-xs font-semibold transition-colors duration-300 {on
                                    ? 'bg-[#2a2a2a] text-white'
                                    : 'text-[#9a9a9a] hover:text-white'}">{label}</button
                            >
                        {/each}
                    </div>
                </div>
                <div class="min-h-3.5 px-4 pt-1.5 font-code text-[10px] tracking-[0.18em] text-[#7f7f7f]">
                    {view.group === 'lofi' ? 'FEATURED' : view.group === 'mine' ? `MINE · ${slotCount} OF 5` : ''}
                </div>

                {#if view.group !== 'mine'}
                    <div class="grid min-h-72.5 grid-cols-2 content-start gap-2 px-4 pt-2.5 pb-4">
                        {#each PRESETS[view.group] as preset (preset.id)}
                            {@const on = view.active === preset.id}
                            <button
                                type="button"
                                onclick={() => takeOver({ active: on ? null : preset.id })}
                                aria-pressed={on}
                                class="flex flex-col gap-1.75 rounded-[11px] border px-3.25 py-3 text-left transition-[border-color,background-color,box-shadow,scale] duration-400 ease-[cubic-bezier(.3,1.6,.5,1)] {on
                                    ? 'scale-[1.02] border-host bg-host/8 shadow-[0_0_0_1px_color-mix(in_srgb,var(--host)_35%,transparent),0_10px_28px_color-mix(in_srgb,var(--host)_14%,transparent)]'
                                    : 'border-white/7 bg-[#1b1b1b] hover:border-white/15'}"
                            >
                                <span class="flex min-w-0 items-center gap-2 text-sm font-semibold">
                                    <preset.icon size={15} class="shrink-0 {on ? 'text-host' : 'text-[#bdbdbd]'}" />
                                    <span class="truncate">{preset.name}</span>
                                    {#if on}<span class="size-1.5 shrink-0 rounded-full bg-host shadow-[0_0_8px_var(--host)]"></span>{/if}
                                </span>
                                <span class="truncate font-code text-[11px] text-[#8a8a8a]">{preset.chips}</span>
                            </button>
                        {/each}
                    </div>
                {:else}
                    <div class="flex min-h-72.5 flex-col gap-1.5 px-4 pt-2.5 pb-4">
                        {#each MINE as id, i (id)}
                            {@const preset = BY_ID[id]}
                            {@const on = view.active === id}
                            {@const pressing = view.press === i + 1}
                            <div
                                class="flex items-center gap-3 rounded-[11px] border px-3 py-2.5 transition-[opacity,translate,border-color,background-color] duration-500 {on
                                    ? 'border-host bg-host/8'
                                    : 'border-white/7 bg-[#1b1b1b]'} {i < slotCount ? 'translate-y-0 opacity-100' : 'translate-y-3.5 opacity-0'}"
                            >
                                <span
                                    class="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-white/18 px-1.5 font-code text-[11px] transition-all duration-200 {pressing
                                        ? 'translate-y-px border-b bg-host-strong text-host-ink'
                                        : 'border-b-2 bg-[#222] text-[#dcdcdc]'}">{i + 1}</span
                                >
                                <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span class="text-sm font-semibold">{preset.name}</span>
                                    <span class="truncate font-code text-[11px] text-[#8a8a8a]">{preset.chips}</span>
                                </span>
                                <Star size={14} class="text-[#ffa42b]" fill="#ffa42b" />
                            </div>
                        {/each}
                        <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-[11px] border border-dashed border-white/18 p-2.75 text-[13px] text-[#d0d0d0]">
                            + Save what's playing<span class="text-[#7f7f7f]">as Preset {slotCount + 1} · {slotsLeft} {slotsLeft === 1 ? 'slot' : 'slots'} left</span>
                        </div>
                        <span class="mt-0.5 text-[11px] text-[#8a8a8a]">Each slot has a keyboard shortcut. Press it again to turn it off.</span>
                    </div>
                {/if}

                <div class="flex items-center justify-between gap-3 border-t border-white/7 px-4 py-2.75 text-xs text-[#7f7f7f]">
                    <span>{view.group === 'mine' ? 'Slots 1–5 · your shortcuts' : 'Tap a preset again to turn it off'}</span>
                    <button
                        type="button"
                        onclick={() => takeOver({ active: null })}
                        class="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-300 {active
                            ? 'text-[#dcdcdc]'
                            : 'text-[#5f5f5f]'}"
                    >
                        <Power size={14} />Normal
                    </button>
                </div>

                <div
                    role="status"
                    aria-live="polite"
                    class="pointer-events-none absolute bottom-14 left-1/2 z-2 -translate-x-1/2 rounded-[10px] bg-[#f5f5f7] px-3.5 py-2.25 text-[13px] font-semibold whitespace-nowrap text-[#0b0b0b] shadow-[0_14px_34px_rgba(0,0,0,0.55)] transition-[opacity,translate] duration-400 {toast
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2.5 opacity-0'}"
                >
                    {toast}
                </div>
            </div>

            <div class="mt-3 flex min-h-7.5 items-center justify-between gap-3 text-xs text-[#7f7f7f]">
                <span>The Presets tab, as it looks in the {youtube ? 'YouTube' : 'Spotify'} rack. Click around.</span>
                {#if manual}
                    <button
                        type="button"
                        onclick={replay}
                        class="inline-flex items-center gap-1.5 rounded-full border border-white/14 px-3 py-1.5 text-xs text-[#dcdcdc] hover:border-white/30"
                    >
                        <Play size={11} fill="currentColor" />Play the demo
                    </button>
                {/if}
            </div>
        </div>
    </div>
</section>
