<script lang="ts">
    import AudioManager from '../../lib/audio-effects/audio-manager'
    import EqualizerClass from '../../lib/audio-effects/equalizer'
    import ReverbClass from '../../lib/audio-effects/reverb'
    import MSProcessorClass from '../../lib/audio-effects/ms-processor'
    import TransportBar from './TransportBar.svelte'
    import Playlist from './Playlist.svelte'
    import EqualizerPanel from './EqualizerPanel.svelte'
    import ReverbPanel from './ReverbPanel.svelte'
    import MSProcessorPanel from './MSProcessorPanel.svelte'
    import SpeedPitchPanel from './SpeedPitchPanel.svelte'
    import SnipsPanel from './SnipsPanel.svelte'
    import SeekingPanel from './SeekingPanel.svelte'
    import type { Track } from './Playlist.svelte'

    const TABS = ['snip', 'speed', 'fx|eq', 'ms', 'seek'] as const
    type Tab = (typeof TABS)[number]

    const DEFAULT_TRACKS: Track[] = [
        { id: '1', title: 'Demo Track 1', src: '/audio/demo-track-1.mp3', blocked: false },
        { id: '2', title: 'Demo Track 2', src: '/audio/demo-track-2.mp3', blocked: false },
        { id: '3', title: 'Demo Track 3', src: '/audio/demo-track-3.mp3', blocked: false },
        { id: '4', title: 'Demo Track 4', src: '/audio/demo-track-4.mp3', blocked: false }
    ]

    let audioEl = $state<HTMLAudioElement | null>(null)
    let audioManager = $state<AudioManager | null>(null)
    let equalizer = $state<EqualizerClass | null>(null)
    let reverb = $state<ReverbClass | null>(null)
    let msProcessor = $state<MSProcessorClass | null>(null)
    let isInitialized = $state(false)
    let activeTab = $state<Tab>('snip')
    let tracks = $state<Track[]>([...DEFAULT_TRACKS])
    let currentTrackId = $state(DEFAULT_TRACKS[0].id)
    let uploadCounter = $state(0)

    let currentTrack = $derived(tracks.find((t) => t.id === currentTrackId))

    async function handleInit() {
        if (!audioEl || isInitialized) return

        try {
            const manager = new AudioManager(audioEl)
            await manager.init()
            audioManager = manager

            equalizer = new EqualizerClass(manager)
            reverb = new ReverbClass(manager)
            msProcessor = new MSProcessorClass(manager)

            isInitialized = true
        } catch (error) {
            console.error('Failed to initialize audio engine:', error)
        }
    }

    function selectTrack(id: string) {
        const track = tracks.find((t) => t.id === id)
        if (!track || track.blocked) return
        currentTrackId = id
        if (audioEl) {
            audioEl.src = track.src
            if (isInitialized) {
                audioEl.play()
            }
        }
    }

    function nextTrack() {
        const unblockedTracks = tracks.filter((t) => !t.blocked)
        if (unblockedTracks.length === 0) return
        const currentIndex = unblockedTracks.findIndex((t) => t.id === currentTrackId)
        const nextIndex = (currentIndex + 1) % unblockedTracks.length
        selectTrack(unblockedTracks[nextIndex].id)
    }

    function prevTrack() {
        const unblockedTracks = tracks.filter((t) => !t.blocked)
        if (unblockedTracks.length === 0) return
        const currentIndex = unblockedTracks.findIndex((t) => t.id === currentTrackId)
        const prevIndex = (currentIndex - 1 + unblockedTracks.length) % unblockedTracks.length
        selectTrack(unblockedTracks[prevIndex].id)
    }

    function toggleBlock(id: string) {
        tracks = tracks.map((t) => (t.id === id ? { ...t, blocked: !t.blocked } : t))
        // If current track got blocked, skip to next
        if (id === currentTrackId && tracks.find((t) => t.id === id)?.blocked) {
            nextTrack()
        }
    }

    function handleFileUpload(file: File) {
        uploadCounter++
        const url = URL.createObjectURL(file)
        const newTrack: Track = {
            id: `upload-${uploadCounter}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            src: url,
            blocked: false
        }
        tracks = [...tracks, newTrack]
        selectTrack(newTrack.id)
    }

    // Auto-skip blocked tracks on track end
    $effect(() => {
        if (!audioEl) return

        const onEnded = () => {
            nextTrack()
        }

        audioEl.addEventListener('ended', onEnded)
        return () => audioEl!.removeEventListener('ended', onEnded)
    })

    // Update audio src when track changes
    $effect(() => {
        if (audioEl && currentTrack) {
            if (audioEl.src !== currentTrack.src) {
                audioEl.src = currentTrack.src
            }
        }
    })
</script>

<div class="h-full rounded-xl border border-white/5 bg-[#181818]">
    <!-- Hidden audio element -->
    <audio
        bind:this={audioEl}
        src={currentTrack?.src}
        crossorigin="anonymous"
        preload="metadata"
    ></audio>

    <!-- Transport bar -->
    <TransportBar
        {audioEl}
        {isInitialized}
        onInit={handleInit}
        onPrev={prevTrack}
        onNext={nextTrack}
        onFileUpload={handleFileUpload}
        trackTitle={currentTrack?.title ?? 'No track'}
    />

    <div class="flex justify-between w-full gap-x-4">
        <!-- Playlist -->
         <div class="flex w-full">
            <Playlist
                {tracks}
                {currentTrackId}
                onSelect={selectTrack}
                onToggleBlock={toggleBlock}
            />
        </div>


        <div class="flex flex-col w-full min-h-62.5">
            <!-- Tab navigation -->
            <div class="flex h-6 items-center w-full gap-x-1 border-b border-white/5 px-4 py-5">
                {#each TABS as tab}
                    <button
                        onclick={() => (activeTab = tab)}
                        class="rounded-xs px-1.5 py-0 pb-0.5 text-sm font-semibold leading-4.5 text-[#fafafa] transition
                            {activeTab === tab
                            ? 'bg-green-700 hover:bg-green-800'
                            : 'bg-zinc-700 hover:bg-zinc-500'}"
                    >
                        {tab}
                    </button>
                {/each}
            </div>

            <!-- Tab content -->
            <div class="p-5 w-full">
                {#if activeTab === 'fx|eq'}
                    <div class="flex h-full w-full justify-center gap-x-2.5">
                        <ReverbPanel {reverb} isReady={isInitialized} />
                        <EqualizerPanel {equalizer} isReady={isInitialized} />
                    </div>
                {:else if activeTab === 'ms'}
                    <MSProcessorPanel msProcessor={msProcessor} isReady={isInitialized} />
                {:else if activeTab === 'speed'}
                    <SpeedPitchPanel audioManager={audioManager} {audioEl} isReady={isInitialized} />
                {:else if activeTab === 'snip'}
                    <SnipsPanel {audioEl} />
                {:else if activeTab === 'seek'}
                    <SeekingPanel {audioEl} />
                {/if}
            </div>
        </div>
    </div>


    <!-- Status bar -->
    <div class="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[10px] text-[#b3b3b3]">
        <span>
            {isInitialized ? 'Audio engine active' : 'Press play to initialize audio engine'}
        </span>
        <span>
            Web Audio API + AudioWorklet
        </span>
    </div>
</div>
