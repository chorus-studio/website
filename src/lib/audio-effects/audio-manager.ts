import SoundTouch from './soundtouch'
import type { SoundTouchData } from './soundtouch'

export default class AudioManager {
    private _gainNode?: GainNode
    private _soundTouchNode?: AudioNode
    private _audioContext?: AudioContext
    private _soundTouchManager?: SoundTouch | null
    private _destination?: AudioDestinationNode

    private _setupPromise?: Promise<void>
    private _isInitialized: boolean = false

    private _element: HTMLAudioElement
    private _source?: MediaElementAudioSourceNode
    private _sourceMap: Map<HTMLAudioElement, MediaElementAudioSourceNode> = new Map()

    private _currentVolume: number = 1

    private _activeEffects: {
        equalizer?: { input: AudioNode; output: AudioNode } | AudioNode
        msProcessor?: AudioWorkletNode
        reverb?: AudioNode
    } = {}

    private _reverbGainNodes: { dry?: GainNode; wet?: GainNode } = {}

    constructor(element: HTMLAudioElement) {
        this._element = element
    }

    async init(): Promise<void> {
        this._setupPromise = this.initialize()
        await this._setupPromise
    }

    private async initialize(): Promise<void> {
        try {
            if (!this._audioContext || this._audioContext.state === 'closed') {
                this._audioContext = new AudioContext({ latencyHint: 'playback' })
            }

            if (this._audioContext.state === 'suspended') {
                await this._audioContext.resume()
            }

            this.cleanup()

            if (this._element.readyState >= 2) {
                await this.setupAudioChain()
            } else {
                await new Promise<void>((resolve) => {
                    this._element.addEventListener(
                        'loadedmetadata',
                        async () => {
                            await this.setupAudioChain()
                            resolve()
                        },
                        { once: true }
                    )
                })
            }

            this._isInitialized = true
        } catch (error) {
            console.error('Failed to set up Web Audio API:', error)
            throw error
        }
    }

    private async setupAudioChain() {
        try {
            if (!this._audioContext) {
                throw new Error('AudioContext not initialized')
            }

            const existingSource = this._sourceMap.get(this._element)
            if (existingSource) {
                this._source = existingSource
            } else {
                this._source = this._audioContext.createMediaElementSource(this._element)
                this._sourceMap.set(this._element, this._source)
            }

            this._element.volume = 1
            this._element.muted = false

            if (!this._gainNode) {
                this._gainNode = this._audioContext.createGain()
                this._gainNode.channelCount = 2
                this._gainNode.channelCountMode = 'clamped-max'
            }

            if (!this._soundTouchNode) await this.loadSoundTouch()

            this._destination = this._audioContext.destination

            if (this.isConnectable) {
                this.source!.connect(this._gainNode!)
                this._gainNode!.connect(this._soundTouchNode!)
                this._soundTouchNode!.connect(this.destination!)
            } else {
                throw new Error('Failed to create audio chain nodes')
            }
        } catch (error) {
            console.error('Failed to create audio chain:', error)
            throw error
        }
    }

    async ensureAudioChainReady() {
        if (!this._setupPromise) {
            throw new Error('AudioManager not properly initialized')
        }

        await this._setupPromise

        if (!this._isInitialized) {
            throw new Error('AudioManager initialization failed')
        }

        if (!this._audioContext || this._audioContext.state === 'closed') {
            throw new Error('AudioContext is not available')
        }

        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume()
        }
    }

    setGain(value: number) {
        if (!this._gainNode) return
        this._currentVolume = value
        if (value === 0) {
            this._gainNode.gain.value = 0
            return
        }
        this._gainNode.gain.value = Math.max(0, value)
    }

    get isConnectable() {
        return Boolean(this.source && this.destination && this._gainNode && this._soundTouchNode)
    }

    getGainPairing(effect: string) {
        const pairings = {
            kick_ir: { dry: 0.5, wet: 0.5 },
            muffler_ir: { dry: 0.4, wet: 0.6 },
            diffusor_ir: { dry: 0.4, wet: 0.6 },
            telephone_ir: { dry: 0.3, wet: 0.7 }
        }
        return pairings[effect as keyof typeof pairings]
    }

    connectDigitalReverb(digitalReverbNode: AudioWorkletNode) {
        if (!this.isConnectable || !this._audioContext) return

        this._activeEffects.reverb = digitalReverbNode
        this.rebuildEffectChain()
    }

    connectImpulseReverb({
        convolverNode,
        effect
    }: {
        convolverNode: ConvolverNode
        effect: string
    }) {
        if (!this.isConnectable || !this._audioContext) return

        this.cleanupEffectChain()

        this.source!.connect(this._gainNode!)

        let currentNode: AudioNode = this._gainNode!

        if (this._activeEffects.equalizer) {
            if (
                typeof this._activeEffects.equalizer === 'object' &&
                'input' in this._activeEffects.equalizer
            ) {
                currentNode.connect(this._activeEffects.equalizer.input)
                currentNode = this._activeEffects.equalizer.output
            } else {
                currentNode.connect(this._activeEffects.equalizer)
                currentNode = this._activeEffects.equalizer
            }
        }

        if (this._activeEffects.msProcessor) {
            currentNode.connect(this._activeEffects.msProcessor)
            currentNode = this._activeEffects.msProcessor
        }

        const dryGainNode = this._audioContext.createGain()
        const wetGainNode = this._audioContext.createGain()

        const { dry, wet } = this.getGainPairing(effect)

        dryGainNode.gain.value = dry
        wetGainNode.gain.value = wet

        currentNode.connect(dryGainNode)
        currentNode.connect(convolverNode)

        convolverNode.connect(wetGainNode)
        dryGainNode.connect(this._soundTouchNode!)
        wetGainNode.connect(this._soundTouchNode!)

        this._soundTouchNode!.connect(this.destination!)

        this._activeEffects.reverb = convolverNode
        this._reverbGainNodes = { dry: dryGainNode, wet: wetGainNode }
    }

    connectEqualizer(equalizerNode: AudioNode | { input: AudioNode; output: AudioNode }) {
        if (!this.isConnectable) return

        this._activeEffects.equalizer = equalizerNode
        this.rebuildEffectChain()
    }

    connectMSProcessor(msProcessorNode: AudioWorkletNode) {
        if (!this.isConnectable) return

        this._activeEffects.msProcessor = msProcessorNode
        this.rebuildEffectChain()
    }

    private cleanupEffectChain() {
        if (!this._gainNode || !this._soundTouchNode) return

        try {
            if (this.source) {
                try {
                    this.source.disconnect()
                } catch (e) {
                    // Source might not be connected yet
                }
            }

            this._gainNode.disconnect()
            this._soundTouchNode.disconnect()

            if (this._activeEffects.equalizer) {
                if (
                    typeof this._activeEffects.equalizer === 'object' &&
                    'input' in this._activeEffects.equalizer
                ) {
                    try {
                        this._activeEffects.equalizer.output.disconnect()
                    } catch (e) {
                        // Ignore
                    }
                } else {
                    this._activeEffects.equalizer.disconnect()
                }
            }
            if (this._activeEffects.msProcessor) this._activeEffects.msProcessor.disconnect()
            if (this._activeEffects.reverb) this._activeEffects.reverb.disconnect()

            if (this._reverbGainNodes.dry) {
                try {
                    this._reverbGainNodes.dry.disconnect()
                } catch (e) {
                    // Ignore
                }
            }
            if (this._reverbGainNodes.wet) {
                try {
                    this._reverbGainNodes.wet.disconnect()
                } catch (e) {
                    // Ignore
                }
            }
            this._reverbGainNodes = {}
        } catch (error) {
            console.warn('Error during cleanup:', error)
        }
    }

    private rebuildEffectChain() {
        if (!this._gainNode || !this._soundTouchNode || !this.destination || !this.source) {
            return
        }

        try {
            this.cleanupEffectChain()

            this.source.connect(this._gainNode)

            let currentNode: AudioNode = this._gainNode

            if (this._activeEffects.equalizer) {
                if (
                    typeof this._activeEffects.equalizer === 'object' &&
                    'input' in this._activeEffects.equalizer
                ) {
                    currentNode.connect(this._activeEffects.equalizer.input)
                    currentNode = this._activeEffects.equalizer.output
                } else {
                    currentNode.connect(this._activeEffects.equalizer)
                    currentNode = this._activeEffects.equalizer
                }
            }

            if (this._activeEffects.msProcessor) {
                currentNode.connect(this._activeEffects.msProcessor)
                currentNode = this._activeEffects.msProcessor
            }

            if (this._activeEffects.reverb) {
                if (this._activeEffects.reverb instanceof AudioWorkletNode) {
                    const dryBypass = this._audioContext!.createGain()
                    dryBypass.gain.value = 1.0

                    currentNode.connect(dryBypass)
                    currentNode.connect(this._activeEffects.reverb)

                    dryBypass.connect(this._soundTouchNode)
                    this._activeEffects.reverb.connect(this._soundTouchNode)

                    this._reverbGainNodes = { dry: dryBypass }

                    this._soundTouchNode.connect(this.destination)
                    return
                }

                currentNode.connect(this._activeEffects.reverb)
                currentNode = this._activeEffects.reverb
            }

            currentNode.connect(this._soundTouchNode)
            this._soundTouchNode.connect(this.destination)
        } catch (error) {
            console.error('Error rebuilding effect chain:', error)
            throw error
        }
    }

    disconnect() {
        if (!this.isConnectable) return

        this.cleanupEffectChain()
        this._activeEffects = {}

        if (this.source && this._gainNode && this._soundTouchNode && this.destination) {
            this.source.connect(this._gainNode)
            this._gainNode.connect(this._soundTouchNode)
            this._soundTouchNode.connect(this.destination)
        }
    }

    removeEffect(effectType: 'equalizer' | 'msProcessor' | 'reverb') {
        delete this._activeEffects[effectType]
        this.rebuildEffectChain()
    }

    private async loadSoundTouch() {
        this._soundTouchManager = new SoundTouch(this.audioContext!)
        await this._soundTouchManager.loadModule()
        this._soundTouchNode = this._soundTouchManager.soundtouchNode
    }

    async applySoundTouch(settings: SoundTouchData) {
        if (!this._soundTouchManager) return
        this._soundTouchManager?.applySettings(settings)
    }

    cleanup() {
        try {
            if (this._source) {
                this._source.disconnect()
            }
            if (this._gainNode) {
                this._gainNode.disconnect()
                this._gainNode = undefined
            }
            if (this._soundTouchNode) {
                this._soundTouchNode.disconnect()
                this._soundTouchNode = undefined
            }
            if (this.destination) {
                this._destination = undefined
            }

            this._sourceMap.clear()

            if (this._soundTouchManager) {
                this._soundTouchManager = null
            }
        } catch (error) {
            console.warn('Error during cleanup:', error)
        }
    }

    dispose() {
        this.cleanup()

        if (this._audioContext && this._audioContext.state !== 'closed') {
            this._audioContext.close()
        }
        this._audioContext = undefined

        this._isInitialized = false
        this._setupPromise = undefined
    }

    set source(source) {
        this._source = source
    }

    get source() {
        return this._source
    }

    get audioContext() {
        return this._audioContext
    }

    get destination() {
        return this._destination
    }
}
