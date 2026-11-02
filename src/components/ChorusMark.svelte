<script lang="ts">
    let {
        size = 26,
        color = 'var(--host)',
        dot = true,
        class: className = ''
    }: { size?: number; color?: string; dot?: boolean; class?: string } = $props()
</script>

<svg width={size} height={size} viewBox="0 0 128 128" fill="none" aria-hidden="true" class={className}>
    <path d="M107.2 36.97A51 51 0 1 0 107.2 91.03" stroke={color} stroke-width="14" stroke-linecap="round" />
    <path d="M86.98 44.72A30 30 0 1 0 86.98 83.28" stroke={color} stroke-width="14" stroke-linecap="round" />
    {#if dot}<circle cx="64" cy="64" r="10" fill="#ffffff" />{/if}
</svg>
