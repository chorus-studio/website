<script lang="ts">
    import { Repeat, Play, Pause } from '@lucide/svelte'

    let {
        audioEl
    }: {
        audioEl: HTMLAudioElement | null
    } = $props()

    let startTime = $state(0)
    let endTime = $state(0)
    let loopEnabled = $state(false)
    let duration = $state(0)
    let currentTime = $state(0)
    let isPlaying = $state(false)
    let dragging = $state<'start' | 'end' | null>(null)

    let hasSnip = $derived(startTime > 0 || endTime < duration)
    let snipDuration = $derived(endTime - startTime)
    let startPercent = $derived(duration > 0 ? (startTime / duration) * 100 : 0)
    let endPercent = $derived(duration > 0 ? (endTime / duration) * 100 : 100)
    let currentPercent = $derived(duration > 0 ? (currentTime / duration) * 100 : 0)

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        const ms = Math.floor((seconds % 1) * 100)
        return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
    }

    function handlePointerDown(handle: 'start' | 'end', e: PointerEvent) {
        dragging = handle
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }

    function handlePointerMove(e: PointerEvent) {
        if (!dragging || !duration) return
        const track = (e.currentTarget as HTMLElement)
        const rect = track.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const time = ratio * duration

        if (dragging === 'start') {
            startTime = Math.min(time, endTime - 0.1)
        } else {
            endTime = Math.max(time, startTime + 0.1)
        }
    }

    function handlePointerUp() {
        dragging = null
    }

    function playSnip() {
        if (!audioEl) return
        audioEl.currentTime = startTime
        audioEl.play()
    }

    function resetSnip() {
        startTime = 0
        endTime = duration || 0
        loopEnabled = false
    }

    $effect(() => {
        if (!audioEl) return

        const onTimeUpdate = () => {
            currentTime = audioEl!.currentTime
            if (loopEnabled && currentTime >= endTime) {
                audioEl!.currentTime = startTime
            }
        }
        const onLoadedMetadata = () => {
            duration = audioEl!.duration
            if (endTime === 0) endTime = audioEl!.duration
        }
        const onPlayEvent = () => (isPlaying = true)
        const onPauseEvent = () => (isPlaying = false)
        const onDurationChange = () => {
            if (audioEl!.duration && isFinite(audioEl!.duration)) {
                duration = audioEl!.duration
                if (endTime === 0 || endTime > duration) endTime = duration
            }
        }

        audioEl.addEventListener('timeupdate', onTimeUpdate)
        audioEl.addEventListener('loadedmetadata', onLoadedMetadata)
        audioEl.addEventListener('durationchange', onDurationChange)
        audioEl.addEventListener('play', onPlayEvent)
        audioEl.addEventListener('pause', onPauseEvent)

        return () => {
            audioEl!.removeEventListener('timeupdate', onTimeUpdate)
            audioEl!.removeEventListener('loadedmetadata', onLoadedMetadata)
            audioEl!.removeEventListener('durationchange', onDurationChange)
            audioEl!.removeEventListener('play', onPlayEvent)
            audioEl!.removeEventListener('pause', onPauseEvent)
        }
    })
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">Snip Editor</span>
        <button
            onclick={resetSnip}
            class="rounded px-2 py-1 text-xs text-[#b3b3b3] transition hover:text-white"
        >
            Reset
        </button>
    </div>

    <!-- Timeline with snip markers -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="relative h-12 select-none rounded-lg border border-white/5 bg-white/5"
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
    >
        <!-- Snip region highlight -->
        <div
            class="absolute top-0 h-full rounded bg-[#1db954]/20"
            style="left: {startPercent}%; width: {endPercent - startPercent}%"
        ></div>

        <!-- Current position -->
        <div
            class="absolute top-0 h-full w-0.5 bg-white"
            style="left: {currentPercent}%"
        ></div>

        <!-- Start handle -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="absolute top-0 h-full w-4 cursor-ew-resize"
            style="left: calc({startPercent}% - 8px)"
            onpointerdown={(e) => handlePointerDown('start', e)}
        >
            <div class="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-[#1db954]"></div>
            <div class="absolute left-1/2 top-1/2 h-4 w-3 -translate-x-1/2 -translate-y-1/2 rounded border border-[#1db954] bg-[#1db954]/30"></div>
        </div>

        <!-- End handle -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="absolute top-0 h-full w-4 cursor-ew-resize"
            style="left: calc({endPercent}% - 8px)"
            onpointerdown={(e) => handlePointerDown('end', e)}
        >
            <div class="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-[#1db954]"></div>
            <div class="absolute left-1/2 top-1/2 h-4 w-3 -translate-x-1/2 -translate-y-1/2 rounded border border-[#1db954] bg-[#1db954]/30"></div>
        </div>
    </div>

    <!-- Time display -->
    <div class="flex justify-between text-xs text-[#b3b3b3]">
        <span>Start: <span class="text-white">{formatTime(startTime)}</span></span>
        <span>Duration: <span class="text-[#1db954]">{formatTime(snipDuration)}</span></span>
        <span>End: <span class="text-white">{formatTime(endTime)}</span></span>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-3">
        <button
            onclick={playSnip}
            class="inline-flex items-center gap-1.5 rounded-full bg-[#1db954] px-4 py-2 text-xs font-medium text-black transition hover:bg-[#1aa34a]"
        >
            {#if isPlaying}
                <Pause size={14} />
            {:else}
                <Play size={14} />
            {/if}
            Play Snip
        </button>

        <button
            onclick={() => (loopEnabled = !loopEnabled)}
            class="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition
                {loopEnabled
                ? 'bg-[#1db954] text-black'
                : 'border border-white/10 text-[#b3b3b3] hover:border-white/20 hover:text-white'}"
        >
            <Repeat size={14} />
            Loop {loopEnabled ? 'On' : 'Off'}
        </button>
    </div>

    <p class="text-center text-xs text-[#b3b3b3]">
        Drag the green handles to set a snip region. In Chorus, snips are saved per track and can be shared via link.
    </p>
</div>
