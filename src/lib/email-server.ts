// Shared by the Pages Functions in functions/api/ (server only; the site never imports it).
// Mail goes out through the EMAIL_WORKER service binding to the worker in workers/email-worker.

export type EmailWorker = { fetch(input: RequestInfo, init?: RequestInit): Promise<Response> }

export type Env = { EMAIL_WORKER?: EmailWorker }

/** Which sender the worker uses: support@ for support requests, feedback@ for feedback. */
export type EmailKind = 'support' | 'feedback'

export const HOSTS: Record<string, string> = { spotify: 'Spotify', youtube: 'YouTube' }

export function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
    })
}

export function jsonError(message: string, status: number) {
    return json({ ok: false, error: message }, status)
}

export function asTrimmedString(value: unknown, maxLength: number) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function asStringArray(value: unknown, maxItems: number, maxLength: number) {
    if (!Array.isArray(value)) return []
    return value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim().slice(0, maxLength))
        .filter(Boolean)
        .slice(0, maxItems)
}

export function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function readJson<T>(request: Request): Promise<T | null> {
    try {
        return (await request.json()) as T
    } catch {
        return null
    }
}

/** Hand an email to the worker; false (and a log line) when it couldn't be sent. */
export async function sendEmail(
    binding: EmailWorker,
    email: { kind: EmailKind; subject: string; body: string; replyEmail: string }
) {
    const response = await binding
        .fetch('https://email-worker/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(email)
        })
        .catch((error: unknown) => error)

    if (response instanceof Response && response.ok) return true
    const detail = response instanceof Response ? `${response.status} ${await response.text()}` : String(response)
    console.error(`Email (${email.kind}) failed:`, detail)
    return false
}
