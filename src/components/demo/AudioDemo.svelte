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

    const TABS = ['EQ', 'Reverb', 'MS Processor', 'Speed/Pitch', 'Snips', 'Seeking'] as const
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
    let activeTab = $state<Tab>('EQ')
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

<div class="overflow-hidden rounded-xl border border-white/5 bg-[#181818]">
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

    <!-- Playlist -->
    <Playlist
        {tracks}
        {currentTrackId}
        onSelect={selectTrack}
        onToggleBlock={toggleBlock}
    />

    <!-- Tab navigation -->
    <div class="flex flex-wrap border-b border-white/5">
        {#each TABS as tab}
            <button
                onclick={() => (activeTab = tab)}
                class="border-b-2 px-4 py-3 text-xs font-medium transition
                    {activeTab === tab
                    ? 'border-[#1db954] text-[#1db954]'
                    : 'border-transparent text-[#b3b3b3] hover:text-white'}"
            >
                {tab}
            </button>
        {/each}
    </div>

    <!-- Tab content -->
    <div class="p-5">
        {#if activeTab === 'EQ'}
            <EqualizerPanel {equalizer} isReady={isInitialized} />
        {:else if activeTab === 'Reverb'}
            <ReverbPanel {reverb} isReady={isInitialized} />
        {:else if activeTab === 'MS Processor'}
            <MSProcessorPanel msProcessor={msProcessor} isReady={isInitialized} />
        {:else if activeTab === 'Speed/Pitch'}
            <SpeedPitchPanel audioManager={audioManager} {audioEl} isReady={isInitialized} />
        {:else if activeTab === 'Snips'}
            <SnipsPanel {audioEl} />
        {:else if activeTab === 'Seeking'}
            <SeekingPanel {audioEl} />
        {/if}
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
