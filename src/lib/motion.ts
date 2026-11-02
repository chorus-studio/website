export function prefersReducedMotion() {
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Attachment: start a muted, looping clip, unless the visitor asked for less motion. */
export function autoplay(video: HTMLVideoElement) {
    video.muted = true
    if (prefersReducedMotion()) return
    video.play().catch(() => {})
}

/** Attachment factory: report whether the element is on screen, so demo loops can rest off it. */
export function visibility(onChange: (visible: boolean) => void) {
    return (node: Element) => {
        const observer = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting), {
            rootMargin: '120px'
        })
        observer.observe(node)
        return () => observer.disconnect()
    }
}
