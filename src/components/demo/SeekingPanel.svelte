<script lang="ts">
    import { Minus, Plus } from '@lucide/svelte'
    import BadgeList from './ui/BadgeList.svelte'

    let {
        audioEl
    }: {
        audioEl: HTMLAudioElement | null
    } = $props()

    let rewindValue = $state(10)
    let forwardValue = $state(10)

    function seekBackward() {
        if (!audioEl) return
        audioEl.currentTime = Math.max(audioEl.currentTime - rewindValue, 0)
    }

    function seekForward() {
        if (!audioEl) return
        audioEl.currentTime = Math.min(audioEl.currentTime + forwardValue, audioEl.duration || 0)
    }

    function handleRewindClick(e: MouseEvent) {
        const target = e.currentTarget as HTMLButtonElement
        const isMinus = target.id.includes('minus')
        rewindValue = Math.min(Math.max(rewindValue + (isMinus ? -1 : 1), 1), 60)
    }

    function handleForwardClick(e: MouseEvent) {
        const target = e.currentTarget as HTMLButtonElement
        const isMinus = target.id.includes('minus')
        forwardValue = Math.min(Math.max(forwardValue + (isMinus ? -1 : 1), 1), 60)
    }
</script>

<div class="flex w-full flex-col justify-center space-y-2 py-2">
    <div class="flex items-center justify-between">
        <!-- Rewind SeekInput -->
        <div class="flex flex-col items-center gap-y-2">
            <BadgeList list={[5, 10, 15, 30]} handleSelect={(v) => { rewindValue = v }} />
            <div class="flex w-full items-center justify-between">
                <button
                    id="seek-rewind-minus"
                    onclick={handleRewindClick}
                    class="flex h-8 w-8 items-center justify-center rounded-sm border-none bg-zinc-700 hover:bg-zinc-800"
                >
                    <Minus color="white" size={24} />
                </button>
                <div class="relative h-12">
                    <button onclick={seekBackward} class="relative h-full cursor-pointer border-none bg-transparent p-0">
                        <span
                            class="absolute left-1/2 top-1/2 z-10 h-7 w-8 -translate-x-1/2 -translate-y-1/2 border-none bg-transparent px-0.5 py-0 text-center text-xl text-white"
                        >{rewindValue}</span>
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-full scale-x-100 fill-none"
                        >
                            <g
                                class="stroke-[#1ed760] stroke-[1.5]"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path
                                    d="m14.55 21.67c4.29-1.13 7.45-5.03 7.45-9.67 0-5.52-4.44-10-10-10-6.67 0-10 5.56-10 5.56m0 0v-4.56m0 4.56h2.01 2.43"
                                ></path>
                                <path d="m2 12c0 5.52 4.48 10 10 10" opacity=".4" stroke-dasharray="3 3"></path>
                            </g>
                        </svg>
                    </button>
                </div>
                <button
                    id="seek-rewind-plus"
                    onclick={handleRewindClick}
                    class="flex h-8 w-8 items-center justify-center rounded-sm border-none bg-zinc-700 hover:bg-zinc-800"
                >
                    <Plus color="white" size={24} />
                </button>
            </div>
        </div>

        <!-- Forward SeekInput -->
        <div class="flex flex-col items-center gap-y-2">
            <BadgeList list={[5, 10, 15, 30]} handleSelect={(v) => { forwardValue = v }} />
            <div class="flex w-full items-center justify-between">
                <button
                    id="seek-forward-minus"
                    onclick={handleForwardClick}
                    class="flex h-8 w-8 items-center justify-center rounded-sm border-none bg-zinc-700 hover:bg-zinc-800"
                >
                    <Minus color="white" size={24} />
                </button>
                <div class="relative h-12">
                    <button onclick={seekForward} class="relative h-full cursor-pointer border-none bg-transparent p-0">
                        <span
                            class="absolute left-1/2 top-1/2 z-10 h-7 w-8 -translate-x-1/2 -translate-y-1/2 border-none bg-transparent px-0.5 py-0 text-center text-xl text-white"
                        >{forwardValue}</span>
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-full scale-x-[-1] fill-none"
                        >
                            <g
                                class="stroke-[#1ed760] stroke-[1.5]"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path
                                    d="m14.55 21.67c4.29-1.13 7.45-5.03 7.45-9.67 0-5.52-4.44-10-10-10-6.67 0-10 5.56-10 5.56m0 0v-4.56m0 4.56h2.01 2.43"
                                ></path>
                                <path d="m2 12c0 5.52 4.48 10 10 10" opacity=".4" stroke-dasharray="3 3"></path>
                            </g>
                        </svg>
                    </button>
                </div>
                <button
                    id="seek-forward-plus"
                    onclick={handleForwardClick}
                    class="flex h-8 w-8 items-center justify-center rounded-sm border-none bg-zinc-700 hover:bg-zinc-800"
                >
                    <Plus color="white" size={24} />
                </button>
            </div>
        </div>
    </div>
</div>
