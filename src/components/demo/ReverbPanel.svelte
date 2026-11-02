<script lang="ts">
    import { RotateCcw } from '@lucide/svelte'
    import type Reverb from '../../lib/audio-effects/reverb'
    import {
        roomPresets,
        customPresets,
        impulsePresets
    } from '../../lib/audio-effects/reverb/presets'
    import CustomSelect from './ui/CustomSelect.svelte'

    let {
        reverb,
        isReady = false
    }: {
        reverb: Reverb | null
        isReady: boolean
    } = $props()

    let activePreset = $state('none')

    const roomOptions = [
        { label: 'none', value: 'none' },
        ...roomPresets.map((p) => ({ label: p, value: p }))
    ]
    const customOptions = [
        { label: 'none', value: 'none' },
        ...impulsePresets.map((p) => ({ label: p, value: p })),
        ...customPresets.map((p) => ({ label: p, value: p }))
    ]

    let topSelected = $derived(roomPresets.includes(activePreset))

    async function handleUpdateEffect(value: string) {
        activePreset = value
        if (reverb && isReady) {
            await reverb.setReverbEffect(value)
        }
    }

    function reset() {
        handleUpdateEffect('none')
    }
</script>

<div class="flex w-full flex-col gap-y-2.5">
    <h2 class="text-base leading-none text-gray-400">reverb</h2>

    <div class="flex w-full flex-col gap-y-1.5">
        <div class="flex flex-col">
            <label class="w-full text-sm text-gray-400">room-sized reverb</label>
            <CustomSelect
                size="md"
                selected={topSelected ? activePreset : 'none'}
                options={roomOptions}
                onValueChange={handleUpdateEffect}
            />
        </div>

        <div class="flex flex-col">
            <label class="w-full text-sm text-gray-400">custom reverb</label>
            <CustomSelect
                size="md"
                selected={!topSelected ? activePreset : 'none'}
                options={customOptions}
                onValueChange={handleUpdateEffect}
            />
        </div>
    </div>

    <div class="mt-1 h-0.5 w-full bg-zinc-700"></div>

    <div class="flex w-full justify-between">
        <button
            class="flex h-6 w-7 items-center justify-center rounded-none text-zinc-400 hover:text-white"
            onclick={reset}
        >
            <RotateCcw size={16} />
        </button>
        <p class="inline-flex w-full justify-end text-sm text-white">
            {activePreset}
        </p>
    </div>
</div>
