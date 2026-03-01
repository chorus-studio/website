<script lang="ts">
    import { Rewind, FastForward } from '@lucide/svelte'

    let {
        audioEl
    }: {
        audioEl: HTMLAudioElement | null
    } = $props()

    let seekDuration = $state(10)
    let currentTime = $state(0)
    let duration = $state(0)

    const SEEK_OPTIONS = [5, 10, 15, 30]

    function seekForward() {
        if (!audioEl) return
        audioEl.currentTime = Math.min(audioEl.currentTime + seekDuration, audioEl.duration || 0)
    }

    function seekBackward() {
        if (!audioEl) return
        audioEl.currentTime = Math.max(audioEl.currentTime - seekDuration, 0)
    }

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    $effect(() => {
        if (!audioEl) return

        const onTimeUpdate = () => (currentTime = audioEl!.currentTime)
        const onLoadedMetadata = () => (duration = audioEl!.duration)
        const onDurationChange = () => {
            if (audioEl!.duration && isFinite(audioEl!.duration)) {
                duration = audioEl!.duration
            }
        }

        audioEl.addEventListener('timeupdate', onTimeUpdate)
        audioEl.addEventListener('loadedmetadata', onLoadedMetadata)
        audioEl.addEventListener('durationchange', onDurationChange)

        return () => {
            audioEl!.removeEventListener('timeupdate', onTimeUpdate)
            audioEl!.removeEventListener('loadedmetadata', onLoadedMetadata)
            audioEl!.removeEventListener('durationchange', onDurationChange)
        }
    })
</script>

<div class="space-y-5">
    <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">Seeking Controls</span>

    <!-- Current position -->
    <div class="text-center">
        <span class="text-2xl font-bold">{formatTime(currentTime)}</span>
        <span class="text-sm text-[#b3b3b3]"> / {formatTime(duration)}</span>
    </div>

    <!-- Seek buttons -->
    <div class="flex items-center justify-center gap-6">
        <button
            onclick={seekBackward}
            class="group flex flex-col items-center gap-1"
        >
            <div class="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 transition group-hover:border-[#1db954]/30 group-hover:bg-[#1db954]/10">
                <Rewind size={24} class="text-[#b3b3b3] transition group-hover:text-[#1db954]" />
            </div>
            <span class="text-xs text-[#b3b3b3]">-{seekDuration}s</span>
        </button>

        <button
            onclick={seekForward}
            class="group flex flex-col items-center gap-1"
        >
            <div class="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 transition group-hover:border-[#1db954]/30 group-hover:bg-[#1db954]/10">
                <FastForward size={24} class="text-[#b3b3b3] transition group-hover:text-[#1db954]" />
            </div>
            <span class="text-xs text-[#b3b3b3]">+{seekDuration}s</span>
        </button>
    </div>

    <!-- Duration selector -->
    <div class="space-y-2">
        <span class="text-center text-xs text-[#b3b3b3]">Seek Duration</span>
        <div class="flex justify-center gap-2">
            {#each SEEK_OPTIONS as option}
                <button
                    onclick={() => (seekDuration = option)}
                    class="rounded-full px-4 py-1.5 text-xs font-medium transition
                        {seekDuration === option
                        ? 'bg-[#1db954] text-black'
                        : 'border border-white/10 text-[#b3b3b3] hover:border-white/20 hover:text-white'}"
                >
                    {option}s
                </button>
            {/each}
        </div>
    </div>

    <p class="text-center text-xs text-[#b3b3b3]">
        In Chorus, seek durations are configurable per content type — shorter for music, longer for podcasts and audiobooks.
    </p>
</div>
