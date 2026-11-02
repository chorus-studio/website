export interface SoundTouchData {
    pitch: number
    semitone: number
}

export default class SoundTouch {
    audioContext: AudioContext
    soundtouchNode?: AudioWorkletNode

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext
    }

    async loadModule() {
        try {
            await this.audioContext.audioWorklet.addModule('/worklets/soundtouch.js')
            this.soundtouchNode = new AudioWorkletNode(this.audioContext, 'soundtouch-processor')
        } catch (error) {
            console.error('Error loading SoundTouch module:', error)
            this.disconnect()
            throw error
        }
    }

    applySettings(settings: SoundTouchData) {
        if (!this.soundtouchNode || !this.audioContext) return

        this.soundtouchNode.parameters.get('pitch')!.value = settings.pitch
        this.soundtouchNode.parameters.get('pitchSemitones')!.value = settings.semitone
    }

    disconnect() {
        if (this.soundtouchNode) {
            this.soundtouchNode.disconnect()
            this.soundtouchNode = undefined
        }
    }

    reset() {
        this.applySettings({ pitch: 1, semitone: 0 })
    }
}
