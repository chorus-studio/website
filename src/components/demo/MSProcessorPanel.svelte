<script lang="ts">
    import { RotateCcw } from '@lucide/svelte'
    import type MSProcessorClass from '../../lib/audio-effects/ms-processor'
    import type { MSParams } from '../../lib/audio-effects/ms-processor'
    import { basicPresets, advancedPresets, MS_PRESETS } from '../../lib/audio-effects/ms-processor/presets'
    import CustomSelect from './ui/CustomSelect.svelte'
    import CustomSlider from './ui/CustomSlider.svelte'

    let {
        msProcessor,
        isReady = false
    }: {
        msProcessor: MSProcessorClass | null
        isReady: boolean
    } = $props()

    let activePreset = $state('none')
    let mode = $state(0)
    let width = $state(100)
    let midGain = $state(0)
    let sideGain = $state(0)
    let balance = $state(0)

    const basicOptions = [
        { label: 'none', value: 'none' },
        ...basicPresets.map((p) => ({ label: p, value: p }))
    ]
    const advancedOptions = [
        { label: 'none', value: 'none' },
        ...advancedPresets.map((p) => ({ label: p, value: p }))
    ]

    let topSelected = $derived(basicPresets.includes(activePreset))
    let isWidthMode = $derived(mode === 5)

    const modeOptions = [
        { label: 'bypass', value: '0' },
        { label: 'left-only', value: '1' },
        { label: 'right-only', value: '2' },
        { label: 'mid-only', value: '3' },
        { label: 'side-only', value: '4' },
        { label: 'width', value: '5' },
        { label: 'swap', value: '6' },
        { label: 'mono', value: '7' },
        { label: 'reverse-phase', value: '8' }
    ]

    function handleUpdateEffect(value: string) {
        activePreset = value
        const preset = MS_PRESETS[value]
        if (preset) {
            mode = preset.mode
            width = preset.width
            midGain = preset.midGain
            sideGain = preset.sideGain
            balance = preset.balance
        }
        if (msProcessor && isReady) {
            msProcessor.setMSEffect(value)
        }
    }

    function handleModeChange(value: string) {
        mode = parseInt(value)
        applyParams()
    }

    function applyParams() {
        if (!msProcessor || !isReady) return
        const params: MSParams = { mode, width, midGain, sideGain, balance }
        msProcessor.applyManualParams(params)
    }

    function reset() {
        handleUpdateEffect('none')
        mode = 0
        width = 100
        midGain = 0
        sideGain = 0
        balance = 0
    }
</script>

<div class="flex w-full flex-col gap-y-2.5">
    <!-- AudioEffectInputs section -->
    <h2 class="text-base leading-none text-gray-400">msProcessor</h2>

    <div class="flex w-full flex-col gap-y-1.5">
        <div class="flex flex-col">
            <span class="w-full text-sm text-gray-400">channel modes</span>
            <CustomSelect
                size="md"
                selected={topSelected ? activePreset : 'none'}
                options={basicOptions}
                onValueChange={handleUpdateEffect}
            />
        </div>

        <div class="flex flex-col">
            <span class="w-full text-sm text-gray-400">stereo processing</span>
            <CustomSelect
                size="md"
                selected={!topSelected ? activePreset : 'none'}
                options={advancedOptions}
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
