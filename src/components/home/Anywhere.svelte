<script lang="ts">
    import { onMount } from 'svelte'
    import Lock from '@lucide/svelte/icons/lock'
    import Puzzle from '@lucide/svelte/icons/puzzle'
    import Moon from '@lucide/svelte/icons/moon'
    import AudioWaveform from '@lucide/svelte/icons/audio-waveform'
    import Power from '@lucide/svelte/icons/power'
    import ChevronLeft from '@lucide/svelte/icons/chevron-left'
    import Heart from '@lucide/svelte/icons/heart'
    import Ban from '@lucide/svelte/icons/ban'
    import InfinityIcon from '@lucide/svelte/icons/infinity'
    import Shuffle from '@lucide/svelte/icons/shuffle'
    import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
    import RotateCw from '@lucide/svelte/icons/rotate-cw'
    import SkipBack from '@lucide/svelte/icons/skip-back'
    import SkipForward from '@lucide/svelte/icons/skip-forward'
    import Repeat from '@lucide/svelte/icons/repeat'
    import Pause from '@lucide/svelte/icons/pause'
    import Play from '@lucide/svelte/icons/play'
    import Volume2 from '@lucide/svelte/icons/volume-2'
    import Undo2 from '@lucide/svelte/icons/undo-2'
    import ThumbsUp from '@lucide/svelte/icons/thumbs-up'
    import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal'
    import PictureInPicture2 from '@lucide/svelte/icons/picture-in-picture-2'
    import X from '@lucide/svelte/icons/x'
    import Sparkles from '@lucide/svelte/icons/sparkles'
    import Scissors from '@lucide/svelte/icons/scissors'
    import Gauge from '@lucide/svelte/icons/gauge'
    import Waves from '@lucide/svelte/icons/waves'
    import MoveHorizontal from '@lucide/svelte/icons/move-horizontal'
    import FastForward from '@lucide/svelte/icons/fast-forward'
    import ChorusMark from '../ChorusMark.svelte'
    import { useHost } from '../../lib/host.svelte'
    import { autoplay, prefersReducedMotion, visibility } from '../../lib/motion'

    const FRAME_MS = 2900
    const TICK_MS = 400

    // The popup takes its colours from the playing cover, so each song brings its own.
    const SONGS = [
        {
            title: 'Afterglow',
            artist: 'Neon Harbor',
            len: '3:41',
            secs: 221,
            snip: 'snip 1:02–2:28',
            rate: '1.25×',
            cover: 'linear-gradient(135deg, #ff8a3d, #c2185b)',
            bg: '#2b1416',
            accent: '#ff5c74',
            muted: '#cba1a7',
            track: '#4a2a2e'
        },
        {
            title: 'Slow Tide',
            artist: 'Mara Vale',
            len: '4:12',
            secs: 252,
            snip: 'snip 0:48–1:30',
            rate: '0.85×',
            cover: 'radial-gradient(circle at 70% 75%, #e9c46a 0 30%, transparent 31%), linear-gradient(160deg, #1b6b63, #0e3b37)',
            bg: '#0f2421',
            accent: '#5eead4',
            muted: '#9cc5bf',
            track: '#24413d'
        },
        {
            title: 'Static Bloom',
            artist: 'Neon Harbor',
            len: '3:18',
            secs: 198,
            snip: 'snip 2:10–2:52',
            rate: '1.00×',
            cover: 'linear-gradient(135deg, #6d28d9, #ff6ec7)',
            bg: '#1d1030',
            accent: '#e38cff',
            muted: '#bba5d1',
            track: '#35254a'
        }
    ]

    type Frame = {
        song: number
        view: 'player' | 'voice'
        sleep: boolean
        corner: 'a' | 'b'
        tab: 'player' | 'presets' | 'speed'
        youtube: 'controls' | 'idle' | 'rack'
    }
    const FRAMES: Frame[] = [
        { song: 0, view: 'player', sleep: false, corner: 'a', tab: 'player', youtube: 'controls' },
        { song: 1, view: 'player', sleep: false, corner: 'b', tab: 'player', youtube: 'controls' },
        { song: 1, view: 'voice', sleep: false, corner: 'b', tab: 'presets', youtube: 'idle' },
        { song: 2, view: 'player', sleep: true, corner: 'b', tab: 'speed', youtube: 'rack' }
    ]

    const RACK_TABS = [
        { id: 'player', label: 'Player', icon: Play },
        { id: 'presets', label: 'Presets', icon: Sparkles },
        { id: 'snip', label: 'Snip', icon: Scissors },
        { id: 'speed', label: 'Speed', icon: Gauge },
        { id: 'fx', label: 'Reverb', icon: Waves },
        { id: 'eq', label: 'EQ', icon: SlidersHorizontal },
        { id: 'ms', label: 'Stereo', icon: MoveHorizontal },
        { id: 'seek', label: 'Seek', icon: FastForward },
        { id: 'sleep', label: 'Sleep', icon: Moon }
    ]
    const MINI_PRESETS = [
        ['Slowed + reverb', '0.85× · hall · low-pass'],
        ['Nightcore', '1.25× · pitch up'],
        ['Classic lo-fi', 'low-pass · tape · studio'],
        ['Stairwell', 'slap · long tail'],
        ['Karaoke', 'centre vocals cut'],
        ['Rainy cafe', '−6 dB air · low-pass']
    ]
    const POPUP_STEPS = [
        { label: 'Colours from the cover', frame: 1 },
        { label: 'Vocals in one tap', frame: 2 },
        { label: 'Sleep timer in the tray', frame: 3 }
    ]
    const CAPTIONS = {
        spotify: [
            'Stays on top of whatever you’re working in',
            'Drag it anywhere on screen',
            'Every tab of the rack comes along',
            'Speed, key, EQ, sleep: all of it'
        ],
        youtube: [
            'The video comes with it',
            'Snip marks, Loop and Block on top',
            'Hold still and the controls fade',
            'The whole rack, one tap away'
        ]
    }

    const host = useHost()

    let frame = $state(0)
    let pos = $state(30)
    let jump = $state(false)
    let visible = $state(false)

    const youtube = $derived(host.current === 'youtube')
    const f = $derived(FRAMES[frame])
    const song = $derived(SONGS[f.song])
    const voice = $derived(f.view === 'voice')
    const elapsed = $derived.by(() => {
        const secs = Math.round((song.secs * pos) / 100)
        return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
    })
    const progressTransition = $derived(`width ${jump ? 0 : TICK_MS}ms linear`)
    const soft = (color: string, percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`

    onMount(() => {
        const still = prefersReducedMotion()
        const advance = setInterval(() => {
            if (still || !visible) return
            const next = (frame + 1) % FRAMES.length
            if (FRAMES[next].song !== FRAMES[frame].song) {
                pos = 8
                jump = true
            }
            frame = next
        }, FRAME_MS)
        const tick = setInterval(() => {
            if (!visible) return
            const next = pos + 0.7
            jump = next > 100
            pos = jump ? 0 : next
        }, TICK_MS)
        return () => {
            clearInterval(advance)
            clearInterval(tick)
        }
    })
</script>

{#snippet transport(size: number, disc: string, discInk: string, loopColor: string)}
    <span class="inline-flex"><Heart size={size} /></span>
    <span class="inline-flex"><Ban size={size} /></span>
    <span class="relative inline-flex" style:color={loopColor}>
        <InfinityIcon size={size} />
        <span class="absolute top-4 left-1/2 -translate-x-1/2 font-code text-[8px] font-bold">2</span>
    </span>
    <span class="w-1.5"></span>
    <span class="inline-flex"><Shuffle size={size} /></span>
    <span class="relative inline-flex">
        <RotateCcw size={size} />
        <span class="absolute top-4 left-1/2 -translate-x-1/2 font-code text-[8px] font-bold">10</span>
    </span>
    <span class="inline-flex"><SkipBack size={size} fill="currentColor" /></span>
    <span
        class="inline-flex size-8 items-center justify-center rounded-full transition-[background-color] duration-700"
        style:background={disc}
    >
        <Pause size={13} fill={discInk} stroke={discInk} />
    </span>
    <span class="inline-flex"><SkipForward size={size} fill="currentColor" /></span>
    <span class="relative inline-flex">
        <RotateCw size={size} />
        <span class="absolute top-4 left-1/2 -translate-x-1/2 font-code text-[8px] font-bold">10</span>
    </span>
    <span class="inline-flex"><Repeat size={size} /></span>
{/snippet}

{#snippet rackTabs(activeId: string, tabs: typeof RACK_TABS, small: boolean)}
    {#each tabs as tab (tab.id)}
        {@const on = tab.id === activeId}
        <span
            class="inline-flex items-center gap-1.25 rounded-[7px] font-semibold whitespace-nowrap transition-colors duration-300 {small
                ? 'h-6 text-[11px]'
                : 'h-6.5 text-xs'} {on ? 'bg-[#2a2a2a] px-2.25 text-white' : 'px-1.5 text-[#9a9a9a]'}"
        >
            <tab.icon size={small ? 12 : 13} />{#if on}{tab.label}{/if}
        </span>
    {/each}
{/snippet}

{#snippet miniPresets(count: number, small: boolean)}
    {#each MINI_PRESETS.slice(0, count) as [name, chips], i (name)}
        <span
            class="flex flex-col gap-1 rounded-[9px] border {small ? 'px-2.25 py-1.75' : 'px-2.5 py-2.25'} {i === 0
                ? 'border-host bg-host/9'
                : 'border-white/7 bg-[#1b1b1b]'}"
        >
            <span class="font-semibold {small ? 'text-[11px]' : 'text-xs'}">{name}</span>
            <span class="truncate font-code text-[#8a8a8a] {small ? 'text-[9px]' : 'text-[10px]'}">{chips}</span>
        </span>
    {/each}
{/snippet}

<section
    id="anywhere"
    aria-label="Toolbar popup and picture-in-picture"
    class="relative overflow-hidden bg-[#0b0b0b] px-6 py-26"
    {@attach visibility((v) => (visible = v))}
>
    <div
        aria-hidden="true"
        class="pointer-events-none absolute top-40 -left-50 h-155 w-205 rounded-full transition-[background] duration-1000"
        style:background="radial-gradient(closest-side, {soft(song.accent, 13)}, transparent)"
    ></div>

    <div class="relative mx-auto flex max-w-290 flex-col gap-11">
        <div class="flex flex-wrap items-end justify-between gap-6">
            <div class="flex max-w-160 flex-col gap-3.5">
                <span class="font-code text-xs tracking-[0.2em] text-host">POPUP · PICTURE-IN-PICTURE</span>
                <h2 class="m-0 font-display text-[clamp(36px,5vw,60px)] leading-[0.98] font-bold tracking-[-0.035em]">
                    Leave the tab. Keep the controls.
                </h2>
            </div>
            <p class="m-0 max-w-105 text-[17px] leading-relaxed text-[#b3b3b3]">
                {#if youtube}
                    The toolbar popup plays, loops and blocks from any tab, in the colours of what’s playing.
                    Picture-in-picture floats the video with Chorus controls on top, and the rack a tap away.
                {:else}
                    The toolbar popup plays, loops and blocks from any tab, in the colours of the cover. Picture-in-picture
                    takes the whole rack into a window that stays on top of everything.
                {/if}
            </p>
        </div>

        <div class="flex flex-wrap items-stretch gap-5">
            <!-- The toolbar popup -->
            <div class="flex min-w-0 flex-[1_1_400px] flex-col gap-3.5">
                <div class="relative h-117.5 overflow-hidden rounded-[20px] border border-white/9 bg-[#101010]">
                    <div class="flex h-11.5 items-center gap-2.5 border-b border-white/6 bg-[#1c1c1c] px-3">
                        <span class="inline-flex gap-1.5">
                            <span class="size-2.5 rounded-full bg-[#3a3a3a]"></span>
                            <span class="size-2.5 rounded-full bg-[#3a3a3a]"></span>
                            <span class="size-2.5 rounded-full bg-[#3a3a3a]"></span>
                        </span>
                        <span class="inline-flex h-7 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full bg-[#2a2a2a] px-3 font-code text-xs whitespace-nowrap text-[#b3b3b3]">
                            <Lock size={11} strokeWidth={2.4} />docs.example.com/notes
                        </span>
                        <span class="inline-flex text-[#8a8a8a]"><Puzzle size={16} /></span>
                        <span class="inline-flex size-7.5 items-center justify-center rounded-lg bg-[#333]">
                            <ChorusMark size={18} color={song.accent} />
                        </span>
                    </div>
                    <div aria-hidden="true" class="absolute inset-x-0 top-11.5 bottom-0 flex gap-4 p-5.5 opacity-30">
                        <div class="flex w-[26%] flex-col gap-2.5">
                            <span class="h-3 w-[70%] rounded bg-[#2e2e2e]"></span>
                            <span class="h-3 w-[52%] rounded bg-[#262626]"></span>
                            <span class="h-3 w-[64%] rounded bg-[#262626]"></span>
                            <span class="h-3 w-[44%] rounded bg-[#262626]"></span>
                        </div>
                        <div class="grid flex-1 grid-cols-2 content-start gap-3">
                            <span class="h-23 rounded-[10px] bg-[#222]"></span>
                            <span class="h-23 rounded-[10px] bg-[#222]"></span>
                            <span class="h-23 rounded-[10px] bg-[#1e1e1e]"></span>
                            <span class="h-23 rounded-[10px] bg-[#1e1e1e]"></span>
                        </div>
                    </div>
                    <div
                        aria-hidden="true"
                        class="absolute top-13 right-5.5 size-3 rotate-45 border-t border-l transition-colors duration-700"
                        style:background={song.bg}
                        style:border-color={soft(song.accent, 20)}
                    ></div>

                    <div
                        class="absolute top-14.5 right-3 w-85 max-w-[calc(100%-24px)] overflow-hidden rounded-[14px] border text-white shadow-[0_30px_80px_rgba(0,0,0,0.65)] transition-colors duration-700"
                        style:background={song.bg}
                        style:border-color={soft(song.accent, 20)}
                    >
                        <div class="relative h-51">
                            <div
                                class="absolute inset-0 flex flex-col gap-2.5 px-3.5 py-3 transition-[opacity,translate] duration-450 {voice
                                    ? '-translate-x-6 opacity-0'
                                    : 'translate-x-0 opacity-100'}"
                            >
                                <div class="flex items-center gap-2">
                                    <ChorusMark size={18} color={song.accent} />
                                    <span class="text-sm font-bold transition-colors duration-700" style:color={song.accent}>Chorus</span>
                                    <span
                                        class="ml-auto inline-flex items-center gap-1 font-code text-[11px] transition-colors duration-500"
                                        style:color={f.sleep ? song.accent : song.muted}
                                    >
                                        <Moon size={15} />
                                        <span class="transition-opacity duration-500 {f.sleep ? 'opacity-100' : 'opacity-0'}">30m</span>
                                    </span>
                                    <span
                                        class="inline-flex rounded-md p-0.75 transition-colors duration-300"
                                        style:background={frame === 1 ? soft(song.accent, 25) : 'transparent'}
                                        style:color={song.muted}
                                    >
                                        <AudioWaveform size={15} />
                                    </span>
                                    <span class="inline-flex" style:color={song.muted}><Power size={15} /></span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div class="relative size-14.5 shrink-0 overflow-hidden rounded-[7px]">
                                        {#each SONGS as s, i (s.title)}
                                            <div
                                                class="absolute inset-0 transition-opacity duration-700"
                                                style:background={s.cover}
                                                style:opacity={i === f.song ? 1 : 0}
                                            ></div>
                                        {/each}
                                    </div>
                                    <div class="flex min-w-0 flex-col gap-0.75">
                                        <span class="truncate text-base font-bold">{song.title}</span>
                                        <span class="text-[13px]" style:color={song.muted}>{song.artist}</span>
                                        <span class="inline-flex items-center gap-1.5 font-code text-[11px] whitespace-nowrap">
                                            <span class="size-1.5 rounded-full" style:background={song.accent}></span>
                                            <span style:color={song.accent}>{song.snip}</span>
                                            <span style:color={song.muted}>{song.rate}</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-1.25">
                                    <div class="relative h-1 rounded-sm transition-colors duration-700" style:background={song.track}>
                                        <div
                                            class="absolute -inset-y-0.5 left-1/4 w-[36%] border-x-2"
                                            style:background={soft(song.accent, 28)}
                                            style:border-color={song.accent}
                                        ></div>
                                        <div
                                            class="absolute inset-y-0 left-0 rounded-sm opacity-85"
                                            style:width="{pos}%"
                                            style:background={song.accent}
                                            style:transition={progressTransition}
                                        ></div>
                                    </div>
                                    <div class="flex justify-between font-code text-[10px]" style:color={song.muted}>
                                        <span>{elapsed}</span><span>{song.len}</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between transition-colors duration-700" style:color={song.muted}>
                                    {@render transport(16, song.accent, song.bg, song.accent)}
                                </div>
                            </div>

                            <div
                                class="absolute inset-0 flex flex-col gap-2.5 px-3.5 py-3 transition-[opacity,translate] duration-450 {voice
                                    ? 'translate-x-0 opacity-100'
                                    : 'translate-x-6 opacity-0'}"
                            >
                                <div class="flex items-center justify-between gap-2">
                                    <span class="inline-flex items-center gap-1 text-[13px]"><ChevronLeft size={14} />Player</span>
                                    <span class="font-code text-[10px] tracking-[0.12em]" style:color={song.muted}>CHROME ONLY · ON-DEVICE</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="flex flex-col gap-0.5">
                                        <span class="text-[15px] font-bold">Vocal separation</span>
                                        <span class="text-xs" style:color={song.muted}>Real-time, applies to this tab</span>
                                    </span>
                                    <span class="inline-flex h-4.5 w-8 justify-end rounded-full p-0.5" style:background={song.accent}>
                                        <span class="size-3.5 rounded-full bg-white"></span>
                                    </span>
                                </div>
                                <div class="grid grid-cols-4 gap-1 text-[11px]">
                                    <span class="rounded-md py-1.5 text-center font-semibold" style:background={soft(song.accent, 28)}>Instrumental</span>
                                    {#each ['Karaoke', 'Acapella', 'Vocals up'] as mode (mode)}
                                        <span class="rounded-md bg-white/5 py-1.5 text-center" style:color={song.muted}>{mode}</span>
                                    {/each}
                                </div>
                                <div class="flex items-center gap-2.5 font-code text-[10px] tracking-[0.12em]" style:color={song.muted}>
                                    <span class="w-23">VOCALS</span>
                                    <span class="relative h-0.75 flex-1 rounded-sm" style:background={song.track}>
                                        <span
                                            class="absolute -top-1 -ml-1.25 size-2.75 rounded-full bg-white transition-[left] duration-900 ease-[cubic-bezier(.3,1.3,.5,1)]"
                                            style:left={voice ? '0%' : '50%'}
                                        ></span>
                                    </span>
                                    <span class="w-8.5 text-right">{voice ? '0%' : '50%'}</span>
                                </div>
                                <div class="flex items-center gap-2.5 font-code text-[10px] tracking-[0.12em]" style:color={song.muted}>
                                    <span class="w-23">INSTRUMENTS</span>
                                    <span class="relative h-0.75 flex-1 rounded-sm" style:background={song.track}>
                                        <span class="absolute inset-y-0 left-0 w-1/2" style:background={song.accent}></span>
                                        <span class="absolute -top-1 left-1/2 -ml-1.25 size-2.75 rounded-full bg-white"></span>
                                    </span>
                                    <span class="w-8.5 text-right">100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-1.5">
                    <span class="font-code text-[11px] tracking-[0.18em] text-[#7f7f7f]">THE TOOLBAR POPUP</span>
                    <div class="flex flex-wrap gap-1.5">
                        {#each POPUP_STEPS as step (step.label)}
                            {@const lit = frame === step.frame}
                            <span
                                class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] transition-all duration-400 {lit
                                    ? 'text-white'
                                    : 'border-white/8 text-[#8a8a8a]'}"
                                style:border-color={lit ? soft(song.accent, 50) : undefined}
                                style:background={lit ? soft(song.accent, 10) : 'transparent'}
                            >
                                <span class="size-1.5 rounded-full transition-colors duration-400" style:background={lit ? song.accent : '#4a4a4a'}></span>
                                {step.label}
                            </span>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Picture-in-picture -->
            <div class="flex min-w-0 flex-[1.45_1_560px] flex-col gap-3.5">
                <div
                    class="relative h-117.5 overflow-hidden rounded-[20px] border border-white/9"
                    style="background: radial-gradient(ellipse at 80% 100%, color-mix(in srgb, var(--host) 14%, transparent), transparent 60%), #0e0e0e"
                >
                    <div aria-hidden="true" class="absolute top-[7%] left-[5%] h-[80%] w-[74%] overflow-hidden rounded-xl border border-white/8 bg-[#161616]">
                        <div class="flex h-7.5 items-center gap-1.5 border-b border-white/5 bg-[#1d1d1d] px-3">
                            <span class="size-2.25 rounded-full bg-[#3a3a3a]"></span>
                            <span class="size-2.25 rounded-full bg-[#3a3a3a]"></span>
                            <span class="size-2.25 rounded-full bg-[#3a3a3a]"></span>
                            <span class="ml-2.5 font-code text-[11px] text-[#6f6f6f]">notes.md · your other work</span>
                        </div>
                        <div class="flex flex-col gap-3 px-6.5 py-5.5">
                            <span class="h-4 w-[46%] rounded bg-[#2c2c2c]"></span>
                            {#each [92, 86, 90, 58, 0, 88, 80, 70] as width, i (i)}
                                <span class="h-2.25 rounded bg-[#232323]" style:width="{width}%"></span>
                            {/each}
                        </div>
                    </div>

                    <div
                        class="absolute w-98 max-w-[calc(100%-32px)] overflow-hidden rounded-xl bg-[#151515] text-white shadow-[0_40px_90px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.14)] transition-[left,top] duration-1300 ease-[cubic-bezier(.6,0,.2,1)]"
                        style:left={f.corner === 'a' ? 'max(16px, calc(100% - 412px))' : '20px'}
                        style:top={f.corner === 'a' ? (youtube ? '170px' : '128px') : youtube ? '40px' : '24px'}
                    >
                        <div class="flex h-7 items-center gap-2 border-b border-white/6 bg-[#202020] pr-2 pl-2.5">
                            <ChorusMark size={12} dot={false} />
                            <span class="font-code text-[10px] text-[#9a9a9a]">{youtube ? 'youtube.com' : 'open.spotify.com'}</span>
                            <span class="ml-auto inline-flex items-center gap-1.25 rounded-md bg-[#2c2c2c] px-2 py-0.75 text-[10px] text-[#dcdcdc]">
                                <PictureInPicture2 size={11} />Back to tab
                            </span>
                            <span class="inline-flex text-[#9a9a9a]"><X size={12} strokeWidth={2.2} /></span>
                        </div>

                        {#if !youtube}
                            <div class="flex items-center gap-px border-b border-white/7 px-2 py-1.75">
                                <ChorusMark size={18} />
                                {@render rackTabs(f.tab, RACK_TABS, false)}
                            </div>
                            <div class="relative h-59">
                                <div class="absolute inset-0 flex flex-col gap-2.75 px-4 py-3.5 transition-opacity duration-450 {f.tab === 'player' ? 'opacity-100' : 'opacity-0'}">
                                    <div class="flex items-center gap-3">
                                        <div class="size-13.5 shrink-0 rounded-[7px]" style:background={SONGS[0].cover}></div>
                                        <div class="flex flex-col gap-0.75">
                                            <span class="text-[15px] font-bold">Afterglow</span>
                                            <span class="text-xs text-[#9a9a9a]">Neon Harbor</span>
                                            <span class="font-code text-[10px]"><span class="text-host">● snip 1:02–2:28</span> <span class="text-[#9a9a9a]">1.25×</span></span>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-1.25">
                                        <div class="relative h-1 rounded-sm bg-[#333]">
                                            <div class="absolute -inset-y-0.5 left-1/4 w-[36%] border-x-2 border-host bg-host/30"></div>
                                            <div
                                                class="absolute inset-y-0 left-0 rounded-sm bg-host opacity-85"
                                                style:width="{pos}%"
                                                style:transition={progressTransition}
                                            ></div>
                                        </div>
                                        <div class="flex justify-between font-code text-[10px] text-[#9a9a9a]">
                                            <span>{elapsed}</span><span>3:41</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between text-[#b3b3b3]">
                                        {@render transport(15, '#e9fbf0', '#0b0b0b', 'var(--host)')}
                                    </div>
                                    <div class="flex items-center gap-2.5 text-[#b3b3b3]">
                                        <Undo2 size={14} />
                                        <Volume2 size={15} />
                                        <span class="relative h-1 flex-1 rounded-sm bg-[#333]">
                                            <span class="absolute inset-y-0 left-0 w-[38%] rounded-sm bg-host"></span>
                                            <span class="absolute -top-1 left-[38%] -ml-1.5 size-3 rounded-full bg-white"></span>
                                        </span>
                                        <span class="font-code text-[11px]">75%</span>
                                    </div>
                                </div>

                                <div class="absolute inset-0 flex flex-col gap-2 px-3.5 py-3 transition-opacity duration-450 {f.tab === 'presets' ? 'opacity-100' : 'opacity-0'}">
                                    <div class="flex items-center justify-between">
                                        <span class="inline-flex items-center gap-2 text-[13px] font-semibold">
                                            <span class="size-1.75 rounded-full bg-host shadow-[0_0_8px_var(--host)]"></span>Slowed + reverb
                                        </span>
                                        <span class="text-[11px] text-[#9a9a9a]">Vibes · Lo-fi · Spaces · Tools · Mine</span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-1.5">{@render miniPresets(6, false)}</div>
                                </div>

                                <div class="absolute inset-0 flex flex-col gap-3 p-4 transition-opacity duration-450 {f.tab === 'speed' ? 'opacity-100' : 'opacity-0'}">
                                    <div class="flex justify-between font-code text-[10px] tracking-[0.15em] text-[#8a8a8a]">
                                        <span>RATE</span><span>0.25 – 4×</span>
                                    </div>
                                    <span class="font-code text-[54px] leading-none text-host">0.85<span class="text-[26px] text-[#b3b3b3]">×</span></span>
                                    <span class="relative h-1 rounded-sm bg-[#333]">
                                        <span class="absolute inset-y-0 left-0 w-[16%] bg-host"></span>
                                        <span class="absolute -top-1.25 left-[16%] -ml-1.75 size-3.5 rounded-full bg-white"></span>
                                    </span>
                                    <div class="flex gap-2 font-code text-[10px] tracking-[0.12em] text-[#8a8a8a]">
                                        <span class="flex flex-1 items-center justify-between rounded-[10px] bg-[#1b1b1b] px-3 py-2.25">
                                            KEEP PITCH
                                            <span class="inline-flex h-4.25 w-7.5 rounded-full bg-[#3a3a3a] p-0.5"><span class="size-3.25 rounded-full bg-white"></span></span>
                                        </span>
                                        <span class="flex flex-1 items-center justify-between rounded-[10px] bg-[#1b1b1b] px-3 py-2.25">
                                            KEY<span class="text-white">−3 st</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <div class="relative aspect-video overflow-hidden bg-black">
                                <video
                                    src="/media/neon-loop.mp4"
                                    loop
                                    muted
                                    playsinline
                                    aria-label="A music video playing in the picture-in-picture window"
                                    class="absolute inset-0 size-full object-cover"
                                    {@attach autoplay}
                                ></video>
                                <div class="absolute inset-0 transition-opacity duration-600 {f.youtube === 'controls' ? 'opacity-100' : 'opacity-0'}">
                                    <div class="absolute inset-x-0 top-0 flex items-start gap-2.5 bg-linear-to-b from-black/75 to-transparent px-3 pt-2.5 pb-6.5">
                                        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <span class="truncate text-[13px] font-semibold">Afterglow (Official Video)</span>
                                            <span class="text-[11px] text-[#cfcfcf]">Neon Harbor</span>
                                        </span>
                                        <span class="inline-flex gap-3"><ThumbsUp size={16} /><Ban size={16} /></span>
                                    </div>
                                    <div class="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-b from-transparent to-black/80 px-3 pt-6.5 pb-2.25">
                                        <div class="relative h-0.75 rounded-sm bg-white/30">
                                            <div class="absolute -inset-y-0.5 left-1/4 w-[36%] border-x-2 border-[#ff0033] bg-[#ff0033]/35"></div>
                                            <div class="absolute inset-y-0 left-0 bg-[#ff0033]" style:width="{pos}%" style:transition={progressTransition}></div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <SkipBack size={14} fill="currentColor" />
                                            <Pause size={16} fill="currentColor" />
                                            <SkipForward size={14} fill="currentColor" />
                                            <span class="font-code text-[10px] text-[#dcdcdc]">{elapsed} / 3:41</span>
                                            <span class="inline-flex text-[#ff4d6d]"><InfinityIcon size={16} /></span>
                                            <span class="ml-auto inline-flex items-center gap-1.5">
                                                <Volume2 size={14} />
                                                <span class="relative h-0.75 w-11 rounded-sm bg-white/30"><span class="absolute inset-y-0 left-0 w-[70%] bg-white"></span></span>
                                            </span>
                                            <span
                                                class="inline-flex items-center gap-1 rounded-md px-1.75 py-0.75 text-[10px] font-semibold transition-colors duration-300 {f.youtube === 'rack'
                                                    ? 'bg-[#ff0033]/60'
                                                    : 'bg-white/14'}"
                                            >
                                                <SlidersHorizontal size={12} />Rack
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="absolute inset-x-0 bottom-0 flex h-[78%] flex-col border-t border-white/10 bg-[#151515]/96 transition-transform duration-550 ease-[cubic-bezier(.3,1.1,.4,1)] {f.youtube === 'rack'
                                        ? 'translate-y-0'
                                        : 'translate-y-[102%]'}"
                                >
                                    <div class="flex items-center gap-px border-b border-white/7 px-2 py-1.5">
                                        {@render rackTabs('presets', RACK_TABS.slice(1), true)}
                                    </div>
                                    <div class="grid grid-cols-2 gap-1.25 px-2.5 py-2">{@render miniPresets(4, true)}</div>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <div class="absolute bottom-4 left-4.5 inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-[#161616]/92 px-3 py-2 text-[13px] text-[#dcdcdc]">
                        <span class="size-1.5 rounded-full bg-host"></span>
                        {CAPTIONS[youtube ? 'youtube' : 'spotify'][frame]}
                    </div>
                </div>
                <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                    <span class="font-code text-[11px] tracking-[0.18em] text-[#7f7f7f]">PICTURE-IN-PICTURE</span>
                    <span class="text-[13px] text-[#7f7f7f]">Needs a Chromium browser such as Chrome or Edge. Not in Firefox yet.</span>
                </div>
            </div>
        </div>
    </div>
</section>
