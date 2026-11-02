<script lang="ts">
    import { Ban, Music } from '@lucide/svelte'

    export interface Track {
        id: string
        title: string
        src: string
        blocked: boolean
    }

    let {
        tracks,
        currentTrackId,
        onSelect,
        onToggleBlock
    }: {
        tracks: Track[]
        currentTrackId: string
        onSelect: (id: string) => void
        onToggleBlock: (id: string) => void
    } = $props()
</script>

<div class="border-b border-white/5 p-5 w-full">
    <div class="mb-2 flex items-center justify-between">
        <span class="text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">Track List</span>
        <span class="text-xs text-[#b3b3b3]">
            {tracks.filter((t) => !t.blocked).length}/{tracks.length} active
        </span>
    </div>
    <div class="space-y-1">
        {#each tracks as track (track.id)}
            <div
                class="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition
                    {track.id === currentTrackId
                    ? 'bg-[#1db954]/10 text-[#1db954]'
                    : track.blocked
                      ? 'text-[#b3b3b3]/40 line-through'
                      : 'text-[#b3b3b3] hover:bg-white/5 hover:text-white'}"
            >
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden"
                    onclick={() => !track.blocked && onSelect(track.id)}
                >
                    <Music size={14} class="shrink-0" />
                    <span class="truncate">{track.title}</span>
                </div>

                <button
                    onclick={() => onToggleBlock(track.id)}
                    class="shrink-0 rounded p-1 transition
                        {track.blocked
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-[#b3b3b3]/0 hover:text-red-400 group-hover:text-[#b3b3b3]/50'}"
                    title={track.blocked ? 'Unblock track' : 'Block track'}
                >
                    <Ban size={14} />
                </button>
            </div>
        {/each}
    </div>
</div>
