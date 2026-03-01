<script lang="ts">
    import type Reverb from '../../lib/audio-effects/reverb'
    import {
        roomPresets,
        customPresets,
        impulsePresets
    } from '../../lib/audio-effects/reverb/presets'

    let {
        reverb,
        isReady = false
    }: {
        reverb: Reverb | null
        isReady: boolean
    } = $props()

    let activePreset = $state('none')
    let activeTab = $state<'rooms' | 'custom' | 'impulse'>('rooms')

    async function selectPreset(name: string) {
        activePreset = name
        if (reverb && isReady) {
            await reverb.setReverbEffect(name)
        }
    }

    async function disable() {
        activePreset = 'none'
        if (reverb && isReady) {
            await reverb.setReverbEffect('none')
        }
    }

    function formatPresetName(name: string): string {
        return name
            .replace('_ir', '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
    }
</script>

<div class="space-y-4">
    <!-- Mode tabs -->
    <div class="flex gap-1 rounded-lg bg-white/5 p-1">
        <button
            onclick={() => (activeTab = 'rooms')}
            class="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition
                {activeTab === 'rooms' ? 'bg-[#1db954] text-black' : 'text-[#b3b3b3] hover:text-white'}"
        >
            Rooms ({roomPresets.length})
        </button>
        <button
            onclick={() => (activeTab = 'custom')}
            class="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition
                {activeTab === 'custom'
                ? 'bg-[#1db954] text-black'
                : 'text-[#b3b3b3] hover:text-white'}"
        >
            Creative ({customPresets.length})
        </button>
        <button
            onclick={() => (activeTab = 'impulse')}
            class="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition
                {activeTab === 'impulse'
                ? 'bg-[#1db954] text-black'
                : 'text-[#b3b3b3] hover:text-white'}"
        >
            Impulse ({impulsePresets.length})
        </button>
    </div>

    <!-- Disable button -->
    <div class="flex items-center justify-between">
        <span class="text-xs text-[#b3b3b3]">
            {activePreset === 'none' ? 'No reverb active' : `Active: ${formatPresetName(activePreset)}`}
        </span>
        <button
            onclick={disable}
            class="rounded px-2 py-1 text-xs text-[#b3b3b3] transition hover:text-white"
            class:text-red-400={activePreset !== 'none'}
        >
            {activePreset === 'none' ? 'Off' : 'Disable'}
        </button>
    </div>

    <!-- Preset grid -->
    <div class="flex flex-wrap gap-1.5">
        {#if activeTab === 'rooms'}
            {#each roomPresets as name}
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
        {:else if activeTab === 'custom'}
            {#each customPresets as name}
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
        {:else}
            {#each impulsePresets as name}
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
            <p class="mt-2 w-full text-xs text-[#b3b3b3]">
                Impulse responses use recorded acoustic spaces for realistic reverb effects.
            </p>
        {/if}
    </div>

    <p class="text-xs text-[#b3b3b3]">
        {#if activeTab === 'rooms' || activeTab === 'custom'}
            Dattorro reverb algorithm — 12 parameters per preset, processed via AudioWorklet.
        {:else}
            Convolver-based reverb using real impulse response WAV files.
        {/if}
    </p>
</div>
