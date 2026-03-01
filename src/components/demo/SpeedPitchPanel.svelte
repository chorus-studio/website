<script lang="ts">
    import { RotateCcw } from '@lucide/svelte'
    import type AudioManager from '../../lib/audio-effects/audio-manager'
    import BadgeList from './ui/BadgeList.svelte'

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

    const SPEED_BADGES = [0.5, 0.75, 1.0, 1.25, 1.5]
    const PITCH_BADGES = [0.5, 0.75, 1.0, 1.25, 1.5]
    const SEMITONE_BADGES = [-5, -3, -1, 0, 1, 3]

    function padValue(value: number, key: string): string {
        if (key === 'semitone') return value.toString()
        return value.toFixed(2)
    }

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

    function handleSpeedInput(event: Event) {
        const input = event.target as HTMLInputElement
        const value = parseFloat(input.value)
        if (!isNaN(value) && value >= 0.5 && value <= 2.0) {
            speed = value
            applySpeed()
        }
    }

    function handlePitchInput(event: Event) {
        const input = event.target as HTMLInputElement
        const value = parseFloat(input.value)
        if (!isNaN(value) && value >= 0.5 && value <= 2.0) {
            pitch = value
            applySoundTouch()
        }
    }

    function handleSemitoneInput(event: Event) {
        const input = event.target as HTMLInputElement
        const value = parseInt(input.value)
        if (!isNaN(value) && value >= -12 && value <= 12) {
            semitone = value
            applySoundTouch()
        }
    }

    function resetSpeed() {
        speed = 1.0
        applySpeed()
    }

    function resetPitch() {
        pitch = 1.0
        applySoundTouch()
    }

    function resetSemitone() {
        semitone = 0
        applySoundTouch()
    }

    $effect(() => {
        applySpeed()
    })
</script>

<div class="columns-2 gap-x-2.5 space-y-3">
    <!-- Left column: Rate + preservesPitch toggle -->
    <div class="flex h-48 flex-col">
        <!-- Rate PlaybackInput -->
        <div class="flex w-full flex-col space-y-2">
            <div class="flex items-center justify-between">
                <h2 class="text-sm text-gray-400">Playback Rate</h2>
                <button
                    class="relative inline-flex h-4 w-8 cursor-pointer items-center rounded-full transition-colors {preservesPitch ? 'bg-green-600' : 'bg-zinc-600'}"
                    onclick={() => { preservesPitch = !preservesPitch; applySpeed() }}
                    title="Preserve Pitch"
                >
                    <span
                        class="inline-block h-3 w-3 rounded-full bg-white transition-transform {preservesPitch ? 'translate-x-4' : 'translate-x-0.5'}"
                    ></span>
                </button>
            </div>
            <BadgeList
                list={SPEED_BADGES}
                handleSelect={(v) => { speed = v; applySpeed() }}
            />
            <div class="flex w-full items-center justify-between">
                <div class="flex flex-col items-center gap-y-1.5">
                    <div class="flex h-6 w-full items-center justify-between gap-x-1.5">
                        <button
                            class="flex h-6 w-7 items-center justify-center rounded-none text-zinc-400 hover:text-white"
                            onclick={resetSpeed}
                        >
                            <RotateCcw size={16} />
                        </button>
                        <div class="flex h-6 w-full items-center">
                            <label
                                class="flex h-6 w-full items-center justify-center border-none bg-zinc-700 pb-[0.125rem] text-center text-base font-bold lowercase leading-5 text-zinc-200"
                            >rate</label>
                            <input
                                value={padValue(speed, 'rate')}
                                onchange={handleSpeedInput}
                                class="h-6 w-full rounded-none border-none bg-green-700 px-1 text-end text-base font-bold text-white outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="my-2 h-0.5 w-full bg-zinc-700"></div>

        <!-- D/T toggle info -->
        <div class="mt-1 flex h-20 w-full flex-col gap-y-4">
            <p class="text-xs leading-none text-zinc-400">
                {preservesPitch
                    ? 'Pitch stays constant when speed changes'
                    : 'Pitch shifts with speed (chipmunk/slow effect)'}
            </p>
        </div>
    </div>

    <!-- Right column: Pitch + Semitone -->
    <div class="flex h-48 flex-col">
        <!-- Pitch PlaybackInput -->
        <div class="flex w-full flex-col space-y-2">
            <h2 class="text-sm text-gray-400">Pitch</h2>
            <BadgeList
                list={PITCH_BADGES}
                handleSelect={(v) => { pitch = v; applySoundTouch() }}
            />
            <div class="flex w-full items-center justify-between">
                <div class="flex flex-col items-center gap-y-1.5">
                    <div class="flex h-6 w-full items-center justify-between gap-x-1.5">
                        <button
                            class="flex h-6 w-7 items-center justify-center rounded-none text-zinc-400 hover:text-white"
                            onclick={resetPitch}
                        >
                            <RotateCcw size={16} />
                        </button>
                        <div class="flex h-6 w-full items-center">
                            <label
                                class="flex h-6 w-full items-center justify-center border-none bg-zinc-700 pb-[0.125rem] text-center text-base font-bold lowercase leading-5 text-zinc-200"
                            >pitch</label>
                            <input
                                value={padValue(pitch, 'pitch')}
                                onchange={handlePitchInput}
                                class="h-6 w-full rounded-none border-none bg-green-700 px-1 text-end text-base font-bold text-white outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="my-2 h-0.5 w-full bg-zinc-700"></div>

        <!-- Semitone PlaybackInput -->
        <div class="flex w-full flex-col space-y-2">
            <h2 class="text-sm text-gray-400">Key</h2>
            <BadgeList
                list={SEMITONE_BADGES}
                handleSelect={(v) => { semitone = v; applySoundTouch() }}
            />
            <div class="flex w-full items-center justify-between">
                <div class="flex flex-col items-center gap-y-1.5">
                    <div class="flex h-6 w-full items-center justify-between gap-x-1.5">
                        <button
                            class="flex h-6 w-7 items-center justify-center rounded-none text-zinc-400 hover:text-white"
                            onclick={resetSemitone}
                        >
                            <RotateCcw size={16} />
                        </button>
                        <div class="flex h-6 w-full items-center">
                            <label
                                class="flex h-6 w-full items-center justify-center border-none bg-zinc-700 pb-[0.125rem] text-center text-base font-bold lowercase leading-5 text-zinc-200"
                            >key</label>
                            <input
                                value={padValue(semitone, 'semitone')}
                                onchange={handleSemitoneInput}
                                class="h-6 w-full rounded-none border-none bg-green-700 px-1 text-end text-base font-bold text-white outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
