<script lang="ts">
    import { RotateCcw } from '@lucide/svelte'
    import type Equalizer from '../../lib/audio-effects/equalizer'
    import { spotifyPresets, customPresets } from '../../lib/audio-effects/equalizer/presets'
    import CustomSelect from './ui/CustomSelect.svelte'

    let {
        equalizer,
        isReady = false
    }: {
        equalizer: Equalizer | null
        isReady: boolean
    } = $props()

    let activePreset = $state('none')

    const spotifyOptions = [
        { label: 'none', value: 'none' },
        ...spotifyPresets.map((p) => ({ label: p, value: p }))
    ]
    const customOptions = [
        { label: 'none', value: 'none' },
        ...customPresets.map((p) => ({ label: p, value: p }))
    ]

    let topSelected = $derived(spotifyPresets.includes(activePreset))

    function handleUpdateEffect(value: string) {
        activePreset = value
        if (equalizer && isReady) {
            equalizer.setEQEffect(value)
        }
    }

    function reset() {
        handleUpdateEffect('none')
    }
</script>

<div class="flex w-full flex-col gap-y-2.5">
    <h2 class="text-base leading-none text-gray-400">equalizer</h2>

    <div class="flex w-full flex-col gap-y-1.5">
        <div class="flex flex-col">
            <label class="w-full text-sm text-gray-400">spotify eq presets</label>
            <CustomSelect
                size="md"
                selected={topSelected ? activePreset : 'none'}
                options={spotifyOptions}
                onValueChange={handleUpdateEffect}
            />
        </div>

        <div class="flex flex-col">
            <label class="w-full text-sm text-gray-400">custom eq presets</label>
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
