<script lang="ts">
    import type AudioManager from '../../lib/audio-effects/audio-manager'

    let {
        audioManager,
        audioEl,
        isReady = false
    }: {
        audioManager: AudioManager | null
        audioEl: HTMLAudioElement | null
        isReady: boolean
    } = $props()

    let speed = $state(1.0)
    let pitch = $state(1.0)
    let semitone = $state(0)
    let preservesPitch = $state(true)

    const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
    const SEMITONE_PRESETS = [-5, -3, -1, 0, 1, 3, 5]

    function applySpeed() {
        if (!audioEl) return
        audioEl.playbackRate = speed
        if ('preservesPitch' in audioEl) {
            audioEl.preservesPitch = preservesPitch
        }
    }

    function applySoundTouch() {
        if (!audioManager || !isReady) return
        audioManager.applySoundTouch({ pitch, semitone })
    }

    function setSpeed(value: number) {
        speed = value
        applySpeed()
    }

    function setSemitone(value: number) {
        semitone = value
        applySoundTouch()
    }

    function reset() {
        speed = 1.0
        pitch = 1.0
        semitone = 0
        preservesPitch = true
        applySpeed()
        applySoundTouch()
    }

    $effect(() => {
        applySpeed()
    })
</script>

<div class="space-y-5">
    <!-- Speed control -->
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">Playback Speed</span>
            <button
                onclick={reset}
                class="rounded px-2 py-1 text-xs text-[#b3b3b3] transition hover:text-white"
            >
                Reset
            </button>
        </div>

        <div class="flex items-center gap-3">
            <span class="w-10 text-right text-xs text-[#b3b3b3]">0.5x</span>
            <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                bind:value={speed}
                oninput={applySpeed}
                class="flex-1 accent-[#1db954]"
            />
            <span class="w-10 text-xs text-[#b3b3b3]">2.0x</span>
        </div>

        <div class="text-center">
            <span class="text-2xl font-bold text-[#1db954]">{speed.toFixed(2)}x</span>
        </div>

        <!-- Speed presets -->
        <div class="flex justify-center gap-2">
            {#each SPEED_PRESETS as preset}
                <button
                    onclick={() => setSpeed(preset)}
                    class="rounded-full px-3 py-1 text-xs transition
                        {speed === preset
                        ? 'bg-[#1db954] text-black'
                        : 'border border-white/10 text-[#b3b3b3] hover:border-white/20 hover:text-white'}"
                >
                    {preset}x
                </button>
            {/each}
        </div>
    </div>

    <!-- Pitch correction toggle -->
    <div class="rounded-lg border border-white/5 bg-white/5 p-4">
        <div class="flex items-center justify-between">
            <div>
                <span class="text-sm font-medium">Preserve Pitch</span>
                <p class="text-xs text-[#b3b3b3]">
                    {preservesPitch
                        ? 'Pitch stays constant when speed changes'
                        : 'Pitch shifts with speed (chipmunk/slow effect)'}
                </p>
            </div>
            <button
                onclick={() => {
                    preservesPitch = !preservesPitch
                    applySpeed()
                }}
                class="rounded-full px-3 py-1.5 text-xs font-medium transition
                    {preservesPitch
                    ? 'bg-[#1db954] text-black'
                    : 'border border-white/10 text-[#b3b3b3]'}"
            >
                {preservesPitch ? 'On' : 'Off'}
            </button>
        </div>
    </div>

    <!-- SoundTouch pitch control -->
    <div class="space-y-3">
        <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]"
            >Pitch (SoundTouch)</span
        >

        <div class="flex items-center gap-3">
            <span class="w-10 text-right text-xs text-[#b3b3b3]">-12</span>
            <input
                type="range"
                min="-12"
                max="12"
                step="1"
                bind:value={semitone}
                oninput={applySoundTouch}
                class="flex-1 accent-[#1db954]"
            />
            <span class="w-10 text-xs text-[#b3b3b3]">+12</span>
        </div>

        <div class="text-center">
            <span class="text-lg font-bold">
                {semitone > 0 ? '+' : ''}{semitone}
                <span class="text-sm text-[#b3b3b3]">semitones</span>
            </span>
        </div>

        <div class="flex justify-center gap-2">
            {#each SEMITONE_PRESETS as preset}
                <button
                    onclick={() => setSemitone(preset)}
                    class="rounded-full px-3 py-1 text-xs transition
                        {semitone === preset
                        ? 'bg-[#1db954] text-black'
                        : 'border border-white/10 text-[#b3b3b3] hover:border-white/20 hover:text-white'}"
                >
                    {preset > 0 ? '+' : ''}{preset}
                </button>
            {/each}
        </div>

        <p class="text-center text-xs text-[#b3b3b3]">
            Real-time pitch shifting via SoundTouch AudioWorklet — independent of playback speed.
        </p>
    </div>
</div>
