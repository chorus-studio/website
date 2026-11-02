<script lang="ts">
    import { Play, Pause, SkipBack, SkipForward, Upload } from '@lucide/svelte'

    let {
        audioEl,
        isInitialized,
        onInit,
        onPrev,
        onNext,
        onFileUpload,
        trackTitle = 'No track loaded'
    }: {
        audioEl: HTMLAudioElement | null
        isInitialized: boolean
        onInit: () => void
        onPrev: () => void
        onNext: () => void
        onFileUpload: (file: File) => void
        trackTitle?: string
    } = $props()

    let isPlaying = $state(false)
    let currentTime = $state(0)
    let duration = $state(0)
    let fileInput: HTMLInputElement

    let progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0)

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    function togglePlay() {
        if (!audioEl) return
        if (!isInitialized) {
            onInit()
        }
        if (audioEl.paused) {
            audioEl.play()
        } else {
            audioEl.pause()
        }
    }

    function seek(e: MouseEvent) {
        if (!audioEl || !duration) return
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const ratio = (e.clientX - rect.left) / rect.width
        audioEl.currentTime = ratio * duration
    }

    function handleFile(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) onFileUpload(file)
    }

    $effect(() => {
        if (!audioEl) return

        const onTimeUpdate = () => (currentTime = audioEl!.currentTime)
        const onLoadedMetadata = () => (duration = audioEl!.duration)
        const onPlayEvent = () => (isPlaying = true)
        const onPauseEvent = () => (isPlaying = false)
        const onEnded = () => (isPlaying = false)
        const onDurationChange = () => {
            if (audioEl!.duration && isFinite(audioEl!.duration)) {
                duration = audioEl!.duration
            }
        }

        audioEl.addEventListener('timeupdate', onTimeUpdate)
        audioEl.addEventListener('loadedmetadata', onLoadedMetadata)
        audioEl.addEventListener('durationchange', onDurationChange)
        audioEl.addEventListener('play', onPlayEvent)
        audioEl.addEventListener('pause', onPauseEvent)
        audioEl.addEventListener('ended', onEnded)

        return () => {
            audioEl!.removeEventListener('timeupdate', onTimeUpdate)
            audioEl!.removeEventListener('loadedmetadata', onLoadedMetadata)
            audioEl!.removeEventListener('durationchange', onDurationChange)
            audioEl!.removeEventListener('play', onPlayEvent)
            audioEl!.removeEventListener('pause', onPauseEvent)
            audioEl!.removeEventListener('ended', onEnded)
        }
    })
</script>

<div class="space-y-3 border-b border-white/5 p-4">
    <!-- Track title -->
    <p class="truncate text-center text-sm font-medium">{trackTitle}</p>

    <!-- Controls row -->
    <div class="flex items-center justify-center gap-4">
        <button onclick={onPrev} class="text-[#b3b3b3] transition hover:text-white" title="Previous">
            <SkipBack size={18} />
        </button>

        <button
            onclick={togglePlay}
            class="flex h-10 w-10 items-center justify-center rounded-full bg-[#1db954] text-black transition hover:bg-[#1aa34a]"
            title={isPlaying ? 'Pause' : 'Play'}
        >
            {#if isPlaying}
                <Pause size={18} />
            {:else}
                <Play size={18} class="ml-0.5" />
            {/if}
        </button>

        <button onclick={onNext} class="text-[#b3b3b3] transition hover:text-white" title="Next">
            <SkipForward size={18} />
        </button>
    </div>

    <!-- Progress bar -->
    <div class="flex items-center gap-3">
        <span class="w-10 text-right text-xs text-[#b3b3b3]">{formatTime(currentTime)}</span>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/10"
            onclick={seek}
        >
            <div
                class="h-full rounded-full bg-[#1db954] transition-[width] duration-75"
                style="width: {progress}%"
            ></div>
        </div>

        <span class="w-10 text-xs text-[#b3b3b3]">{formatTime(duration)}</span>
    </div>

    <!-- Upload button -->
    <div class="flex justify-center">
        <input
            bind:this={fileInput}
            type="file"
            accept="audio/*"
            class="hidden"
            onchange={handleFile}
        />
        <button
            onclick={() => fileInput.click()}
            class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#b3b3b3] transition hover:border-white/20 hover:text-white"
        >
            <Upload size={14} />
            Upload Audio
        </button>
    </div>
</div>
