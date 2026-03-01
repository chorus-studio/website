<script lang="ts">
    import type Equalizer from '../../lib/audio-effects/equalizer'
    import {
        EQ_FILTERS,
        EQ_PRESETS,
        spotifyPresets,
        customPresets
    } from '../../lib/audio-effects/equalizer/presets'

    let {
        equalizer,
        isReady = false
    }: {
        equalizer: Equalizer | null
        isReady: boolean
    } = $props()

    let activePreset = $state('Flat')
    let gains = $state<number[]>(new Array(EQ_FILTERS.length).fill(0))

    function formatFreq(freq: number): string {
        if (freq >= 1000) return `${freq / 1000}k`
        return `${freq}`
    }

    function selectPreset(name: string) {
        activePreset = name
        const presetGains = EQ_PRESETS[name]
        if (presetGains) {
            // Preset gains are 10-band, pad to 19 bands
            gains = EQ_FILTERS.map((_, i) => {
                if (i < 3) return presetGains[0] ?? 0 // lowshelf bands share first value
                if (i >= 17) return presetGains[9] ?? 0 // highshelf bands share last value
                // Map the 10 preset values to the middle 14 bands
                const presetIndex = Math.min(Math.floor((i - 3) * 10 / 14), 9)
                return presetGains[presetIndex] ?? 0
            })
        }
        if (equalizer && isReady) {
            equalizer.setEQEffect(name)
        }
    }

    function reset() {
        selectPreset('Flat')
    }
</script>

<div class="space-y-4">
    <!-- Preset buttons -->
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]"
                >Spotify Presets</span
            >
            <button
                onclick={reset}
                class="rounded px-2 py-1 text-xs text-[#b3b3b3] transition hover:text-white"
            >
                Reset
            </button>
        </div>
        <div class="flex flex-wrap gap-1.5">
            {#each spotifyPresets as name}
                <button
                    onclick={() => selectPreset(name)}
                    class="rounded-full px-3 py-1 text-xs transition
                        {activePreset === name
                        ? 'bg-[#1db954] text-black'
                        : 'border border-white/10 text-[#b3b3b3] hover:border-white/20 hover:text-white'}"
                >
                    {name}
                </button>
            {/each}
        </div>
    </div>

    <div class="space-y-2">
        <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]"
            >Custom Presets</span
        >
        <div class="flex flex-wrap gap-1.5">
            {#each customPresets as name}
                <button
                    onclick={() => selectPreset(name)}
                    class="rounded-full px-3 py-1 text-xs transition
                        {activePreset === name
                        ? 'bg-[#1db954] text-black'
                        : 'border border-white/10 text-[#b3b3b3] hover:border-white/20 hover:text-white'}"
                >
                    {name}
                </button>
            {/each}
        </div>
    </div>

    <!-- EQ Bands visualization -->
    <div class="rounded-lg border border-white/5 bg-white/5 p-4">
        <div class="flex items-end justify-between gap-1">
            {#each EQ_FILTERS as filter, i}
                <div class="flex flex-col items-center gap-1">
                    <div class="relative h-24 w-3">
                        <!-- Background track -->
                        <div class="absolute inset-0 rounded-full bg-white/10"></div>
                        <!-- Fill bar -->
                        <div
                            class="absolute bottom-1/2 w-full rounded-full bg-[#1db954] transition-all duration-150"
                            style="height: {Math.abs(gains[i] ?? 0) * (50 / 12)}%;
                                   {(gains[i] ?? 0) >= 0 ? 'bottom: 50%' : 'top: 50%'}"
                        ></div>
                        <!-- Center line -->
                        <div class="absolute top-1/2 w-full border-t border-white/30"></div>
                    </div>
                    <span class="text-[8px] text-[#b3b3b3]">{formatFreq(filter.freq)}</span>
                </div>
            {/each}
        </div>
    </div>

    <p class="text-center text-xs text-[#b3b3b3]">
        Active: <span class="text-[#1db954]">{activePreset}</span> — 19 bands, Q=1
    </p>
</div>
