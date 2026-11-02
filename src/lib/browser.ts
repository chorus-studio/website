/** The visitor's browser by its everyday name, for support and feedback emails ('' if unknown). */
export function browserName() {
    const ua = navigator.userAgent
    if ('brave' in navigator) return 'Brave'
    if (/Edg\//.test(ua)) return 'Edge'
    if (/OPR\//.test(ua)) return 'Opera'
    if (/Vivaldi/.test(ua)) return 'Vivaldi'
    if (/Firefox\//.test(ua)) return 'Firefox'
    if (/Chrome\//.test(ua)) return 'Chrome'
    if (/Safari\//.test(ua)) return 'Safari'
    return ''
}
