<script lang="ts">
    import type MSProcessorClass from '../../lib/audio-effects/ms-processor'
    import type { MSParams } from '../../lib/audio-effects/ms-processor'
    import { basicPresets, advancedPresets, MS_PRESETS } from '../../lib/audio-effects/ms-processor/presets'

    let {
        msProcessor,
        isReady = false
    }: {
        msProcessor: MSProcessorClass | null
        isReady: boolean
    } = $props()

    const MODE_LABELS: Record<number, string> = {
        0: 'Bypass',
        1: 'Left Only',
        2: 'Right Only',
        3: 'Mid Only',
        4: 'Side Only',
        5: 'Width Control',
        6: 'Swap L/R',
        7: 'Mono',
        8: 'Reverse Phase'
    }

    let mode = $state(0)
    let width = $state(100)
    let midGain = $state(0)
    let sideGain = $state(0)
    let balance = $state(0)
    let activePreset = $state<string | null>(null)

    function applyParams() {
        if (!msProcessor || !isReady) return
        const params: MSParams = { mode, width, midGain, sideGain, balance }
        msProcessor.applyManualParams(params)
    }

    function selectPreset(name: string) {
        activePreset = name
        const preset = MS_PRESETS[name]
        if (preset) {
            mode = preset.mode
            width = preset.width
            midGain = preset.midGain
            sideGain = preset.sideGain
            balance = preset.balance
        }
        if (msProcessor && isReady) {
            msProcessor.setMSEffect(name)
        }
    }

    function disable() {
        activePreset = null
        mode = 0
        width = 100
        midGain = 0
        sideGain = 0
        balance = 0
        if (msProcessor && isReady) {
            msProcessor.setMSEffect('none')
        }
    }

    function formatPresetName(name: string): string {
        return name
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
    }

    $effect(() => {
        // React to manual slider changes
        mode; width; midGain; sideGain; balance;
        if (activePreset === null) return
        activePreset = null
        applyParams()
    })
</script>

<div class="space-y-4">
    <!-- Presets -->
    <div class="space-y-2">
        <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">Basic Modes</span>
            <button
                onclick={disable}
                class="rounded px-2 py-1 text-xs text-[#b3b3b3] transition hover:text-white"
            >
                Bypass
            </button>
        </div>
        <div class="flex flex-wrap gap-1.5">
            {#each basicPresets as name}
                <button
                    onclick={() => selectPreset(name)}
                    class="rounded-full px-3 py-1 text-xs transition
                        {activePreset === name
                        ? 'bg-[#1db954] text-black'
                        : 'border border-white/10 text-[#b3b3b3] hover:border-white/20 hover:text-white'}"
                >
                    {formatPresetName(name)}
                </button>
            {/each}
        </div>
    </div>

    <div class="space-y-2">
        <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">Advanced Presets</span>
        <div class="flex flex-wrap gap-1.5">
            {#each advancedPresets as name}
                <button
                    onclick={() => selectPreset(name)}
                    class="rounded-full px-3 py-1 text-xs transition
                        {activePreset === name
                        ? 'bg-[#1db954] text-black'
                        : 'border border-white/10 text-[#b3b3b3] hover:border-white/20 hover:text-white'}"
                >
                    {formatPresetName(name)}
                </button>
            {/each}
        </div>
    </div>

    <!-- Manual controls -->
    <div class="space-y-3 rounded-lg border border-white/5 bg-white/5 p-4">
        <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">Manual Controls</span>

        <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
                <span class="text-[#b3b3b3]">Mode</span>
                <span class="text-white">{MODE_LABELS[mode] ?? 'Unknown'}</span>
            </div>

            {#if mode === 5}
                <div class="flex items-center justify-between text-xs">
                    <span class="text-[#b3b3b3]">Width</span>
                    <span class="text-white">{width}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="200"
                    step="1"
                    bind:value={width}
                    oninput={applyParams}
                    class="w-full accent-[#1db954]"
                />
            {/if}

            <div class="flex items-center justify-between text-xs">
                <span class="text-[#b3b3b3]">Mid Gain</span>
                <span class="text-white">{midGain} dB</span>
            </div>
            <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                bind:value={midGain}
                oninput={applyParams}
                class="w-full accent-[#1db954]"
            />

            <div class="flex items-center justify-between text-xs">
                <span class="text-[#b3b3b3]">Side Gain</span>
                <span class="text-white">{sideGain} dB</span>
            </div>
            <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                bind:value={sideGain}
                oninput={applyParams}
                class="w-full accent-[#1db954]"
            />

            <div class="flex items-center justify-between text-xs">
                <span class="text-[#b3b3b3]">Balance</span>
                <span class="text-white">{balance}</span>
            </div>
            <input
                type="range"
                min="-100"
                max="100"
                step="1"
                bind:value={balance}
                oninput={applyParams}
                class="w-full accent-[#1db954]"
            />
        </div>
    </div>
</div>
