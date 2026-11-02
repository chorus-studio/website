<script lang="ts">
    let {
        list,
        handleSelect
    }: {
        list: number[]
        handleSelect: (value: number) => void
    } = $props()
</script>

<div class="flex w-full items-center justify-between gap-x-0.5 overflow-x-auto">
    {#each list as item}
        <button
            class="cursor-pointer rounded-[2px] bg-slate-700 px-1.5 py-0 pb-[0.125rem] text-sm font-semibold leading-[18px] text-zinc-200 hover:bg-slate-500"
            onclick={() => handleSelect(item)}
        >
            {item}
        </button>
    {/each}
</div>
