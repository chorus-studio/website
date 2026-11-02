<script lang="ts">
    import { ChevronDown } from '@lucide/svelte'

    let {
        size = 'default',
        selected = 'none',
        onValueChange,
        options = []
    }: {
        size?: 'sm' | 'md' | 'default'
        selected: string
        onValueChange: (value: string) => void
        options: { label: string; value: string }[]
    } = $props()

    let isOpen = $state(false)

    function handleChange(event: Event) {
        const select = event.target as HTMLSelectElement
        onValueChange(select.value)
        isOpen = false
    }

    function handleMouseEnter(e: Event) {
        const target = e.target as HTMLOptionElement
        if (target) {
            target.classList.remove('!bg-[#171717]')
            target.classList.add('!bg-[#3e3d3d]')
        }
    }

    function handleMouseLeave(e: Event) {
        const target = e.target as HTMLOptionElement
        if (target) {
            target.classList.remove('!bg-[#3e3d3d]')
            target.classList.add('!bg-[#171717]')
        }
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement
        if (!target.closest('.custom-select-wrapper')) {
            isOpen = false
        }
    }

    const small = size === 'sm'
    const medium = size === 'md'
</script>

<svelte:window onclick={handleClickOutside} />

<div class="custom-select-wrapper relative flex justify-between">
    <div class="relative {small ? 'min-w-28' : medium ? 'min-w-32' : 'min-w-40'} w-full">
        <button
            class="relative z-50 flex w-full h-7 cursor-pointer appearance-none items-center justify-end rounded-sm border border-zinc-500 bg-transparent px-2 py-1 pr-0 hover:bg-[#3e3d3d]"
            onclick={() => (isOpen = !isOpen)}
        >
            <span class="text-end text-zinc-400">{selected}</span>
            <ChevronDown class="mr-2 size-3 text-zinc-400" />
        </button>

        {#if isOpen}
            <select
                size={3}
                class="absolute left-0 top-full z-[1000] mt-1 flex w-full cursor-pointer appearance-none items-center justify-end overflow-y-scroll rounded-sm border border-zinc-500 bg-[#171717] text-zinc-400 px-2 py-1 pr-2"
                value={selected}
                onchange={handleChange}
            >
                {#each options as option}
                    <option
                        class="-mx-2 cursor-pointer py-1 pr-4 text-end !bg-[#171717] text-sm text-white"
                        value={option.value}
                        onmouseenter={handleMouseEnter}
                        onmouseover={handleMouseEnter}
                        onmouseout={handleMouseLeave}
                        onmouseleave={handleMouseLeave}
                    >
                        {option.label}
                    </option>
                {/each}
            </select>
        {/if}
    </div>
</div>

<style>
    select {
        font-size: 0.875rem;
        color: #a1a1aa;
        max-height: 100px;
    }

    select option {
        background: #52525b;
        color: #a1a1aa;
    }

    select:focus {
        outline: none;
        box-shadow: 0 0 0 1px #71717a;
    }
</style>
