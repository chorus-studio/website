import type AudioManager from '../audio-manager'
import { MS_PRESETS } from './presets'

export interface MSParams {
    mode: number
    width: number
    midGain: number
    sideGain: number
    balance: number
}

export default class MSProcessor {
    private _audioManager: AudioManager
    private _audioContext?: AudioContext
    private _msWorkletNode?: AudioWorkletNode
    private _moduleLoaded: boolean = false

    constructor(audioManager: AudioManager) {
        this._audioManager = audioManager
    }

    async setMSEffect(effect: string) {
        if (!this._audioManager.audioContext) {
            return
        }

        this._audioContext = this._audioManager.audioContext

        if (effect === 'none') {
            this.cleanup()
            if (this._audioManager.audioContext) {
                this._audioManager.removeEffect('msProcessor')
            }
            return
        }

        try {
            if (!this._msWorkletNode) {
                await this.createMSProcessor()
            }
            this.connectMSProcessor()
            this.applyMSEffect(effect)
        } catch (error) {
            console.error('Error setting MS effect:', error)
            this.cleanup()
            if (this._audioManager.audioContext) {
                this._audioManager.disconnect()
            }
            throw error
        }
    }

    async applyManualParams(params: MSParams) {
        if (!this._audioManager.audioContext) {
            return
        }

        this._audioContext = this._audioManager.audioContext

        try {
            if (!this._msWorkletNode) {
                await this.createMSProcessor()
                this.connectMSProcessor()
            }

            this.applyParams(params)
        } catch (error) {
            console.error('Error applying manual MS params:', error)
            throw error
        }
    }

    private async createMSProcessor() {
        if (!this._audioContext) {
            throw new Error('AudioContext not initialized')
        }

        try {
            if (!this._moduleLoaded) {
                await this._audioContext.audioWorklet.addModule('/worklets/ms-processor.js')
                this._moduleLoaded = true
            }

            this._msWorkletNode = new AudioWorkletNode(this._audioContext, 'ms-processor', {
                channelCountMode: 'explicit',
                channelCount: 2,
                outputChannelCount: [2]
            })
        } catch (error) {
            console.error('Failed to create MS processor worklet:', error)
            throw error
        }
    }

    private connectMSProcessor() {
        if (!this._msWorkletNode) {
            throw new Error('MS processor node not initialized')
        }

        this._audioManager.connectMSProcessor(this._msWorkletNode)
    }

    private applyMSEffect(effect: string) {
        if (!this._msWorkletNode || !this._audioContext) {
            throw new Error('MS processor not initialized')
        }

        const presetConfig = MS_PRESETS[effect]
        if (!presetConfig) {
            console.warn(`Unknown MS preset: ${effect}`)
            return
        }

        this.applyParams(presetConfig)
    }

    private applyParams(params: Record<string, number>) {
        if (!this._msWorkletNode || !this._audioContext) {
            throw new Error('MS processor not initialized')
        }

        const currentTime = this._audioContext.currentTime
        const rampTime = 0.05

        Object.entries(params).forEach(([paramName, value]) => {
            const param = this._msWorkletNode?.parameters.get(paramName)
            if (param) {
                param.linearRampToValueAtTime(value, currentTime + rampTime)
            }
        })
    }

    cleanup() {
        if (this._msWorkletNode) {
            try {
                this._msWorkletNode.disconnect()
            } catch (e) {
                // Ignore disconnect errors during cleanup
            }
            this._msWorkletNode = undefined
        }
    }

    dispose() {
        this.cleanup()
        this._audioContext = undefined
    }
}
