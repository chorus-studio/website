<script lang="ts">
    import CustomSlider from './ui/CustomSlider.svelte'

    let {
        audioEl
    }: {
        audioEl: HTMLAudioElement | null
    } = $props()

    let startTime = $state(0)
    let endTime = $state(0)
    let duration = $state(0)
    let isPlaying = $state(false)
    let loopEnabled = $state(true)

    function secondsToTime(totalSeconds: number): string {
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = Math.floor(totalSeconds % 60)
        return `${m.toString().padStart(1, '0')}:${s.toString().padStart(2, '0')}`
    }

    function timeToSeconds(timeStr: string): number | null {
        const parts = timeStr.split(':').map(Number)
        if (parts.length !== 4 || parts.some(isNaN)) return null
        const [h, m, s, ms] = parts
        return h * 3600 + m * 60 + s + ms / 100
    }

    function handleSliderChange(value: number | number[]) {
        const [start, end] = value as number[]
        startTime = start
        endTime = end
        if (audioEl) {
            audioEl.currentTime = start
        }
    }

    function handleStartChange(event: Event) {
        const input = event.target as HTMLInputElement
        const seconds = timeToSeconds(input.value)
        if (seconds !== null && seconds >= 0 && seconds < endTime) {
            startTime = seconds
            if (audioEl) audioEl.currentTime = seconds
        }
    }

    function handleEndChange(event: Event) {
        const input = event.target as HTMLInputElement
        const seconds = timeToSeconds(input.value)
        if (seconds !== null && seconds > startTime && seconds <= duration) {
            endTime = seconds
        }
    }

    function restart() {
        if (audioEl) {
            audioEl.currentTime = startTime
        }
    }

    function togglePlayPause() {
        if (!audioEl) return
        if (audioEl.paused) {
            audioEl.play()
        } else {
            audioEl.pause()
        }
    }

    $effect(() => {
        if (!audioEl) return

        const onTimeUpdate = () => {
            if (loopEnabled && audioEl!.currentTime >= endTime) {
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

<div class="flex h-full w-full flex-col gap-x-1 space-y-6 space-between">
    <!-- TimeSlider -->
    <div class="flex w-full items-center justify-between gap-4">
        <p class="w-full max-w-6 text-xs text-zinc-400">
            {secondsToTime(startTime)}
        </p>
        <CustomSlider
            onValueChange={handleSliderChange}
            type="multiple"
            value={[startTime, endTime]}
            min={0}
            max={duration || 1}
            step={1}
        />
        <p class="w-full max-w-6 text-xs text-zinc-400">
            {secondsToTime(endTime)}
        </p>
    </div>

    <!-- SnipInputs -->
    <p class="-mt-3 flex w-full text-xs text-zinc-400">
        * while editing "end", track plays 3 secs past set end
    </p>

    <div class="-mt-2 grid w-full grid-cols-2">
        <!-- Start/End inputs -->
        <div class="flex flex-col items-center gap-y-1">
            <div class="flex h-6 w-full items-center">
                <label
                    for="startTime"
                    class="flex h-6 w-12 min-w-12 items-center justify-center border-none bg-zinc-700 px-2 py-0 pb-[0.075rem] text-center text-base font-bold lowercase leading-5 text-zinc-200"
                >Start</label>
                <input
                    id="startTime"
                    value={secondsToTime(startTime)}
                    onchange={handleStartChange}
                    class="h-6 w-24 rounded-none border-none bg-green-700 pr-2 text-end text-base font-bold tracking-wide text-white outline-none"
                />
            </div>
            <div class="flex w-full items-center">
                <label
                    for="endTime"
                    class="flex h-6 w-12 min-w-12 items-center justify-center border-none bg-zinc-700 px-2 py-0 pb-[0.075rem] text-center text-base font-bold lowercase leading-5 text-zinc-200"
                >End</label>
                <input
                    id="endTime"
                    value={secondsToTime(endTime)}
                    onchange={handleEndChange}
                    class="h-6 w-24 rounded-none border-none bg-green-700 pr-2 text-end text-base font-bold lowercase tracking-wide text-white outline-none"
                />
            </div>
        </div>

        <!-- Snip length + controls -->
        <div class="flex w-full flex-col items-center gap-1">
            <p class="text-sm text-zinc-400">
                snip length: {secondsToTime(endTime - startTime)}
            </p>
            <div class="flex items-center justify-between gap-x-2">
                <button
                    class="flex h-6 w-6 items-center justify-center rounded-full border-none bg-transparent stroke-current hover:bg-transparent"
                    onclick={restart}
                    title="Restart snip"
                >
                    <svg
                        class="h-5 w-5 fill-none stroke-current stroke-5"
                        viewBox="0 0 64 64"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <path d="M34.46,53.91A21.91,21.91,0,1,0,12.55,31.78"></path>
                        <polyline points="4.65 22.33 12.52 32.62 22.81 24.75"></polyline>
                    </svg>
                </button>
                <button
                    class="flex h-7 w-7 items-center justify-center rounded-full bg-transparent stroke-current hover:bg-transparent"
                    onclick={togglePlayPause}
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    <svg
                        class="h-6 w-6 fill-none stroke-current stroke-1"
                        viewBox="-4 -4 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {#if isPlaying}
                            <path
                                d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"
                            />
                        {:else}
                            <path
                                d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"
                            />
                        {/if}
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>
