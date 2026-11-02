// Cloudflare Pages Function: POST /api/uninstall-feedback, from the /uninstall and
// /youtube/uninstall forms. Pages serves it beside the static Astro build; the email goes out
// through the EMAIL_WORKER service binding, set on the Pages project in the Cloudflare dashboard
// and pointing at the Chorus email worker in workers/email-worker.

type EmailWorker = { fetch(input: RequestInfo, init?: RequestInit): Promise<Response> }

type Env = { EMAIL_WORKER?: EmailWorker }

type Payload = {
    reason?: unknown
    details?: unknown
    host?: unknown
    honeypot?: unknown
}

const HOSTS: Record<string, string> = { spotify: 'Spotify', youtube: 'YouTube' }

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
    })
}

function jsonError(message: string, status: number) {
    return json({ ok: false, error: message }, status)
}

function asTrimmedString(value: unknown, maxLength: number) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
    const binding = env.EMAIL_WORKER
    if (!binding) return jsonError('Email backend is not configured yet.', 503)

    let payload: Payload
    try {
        payload = (await request.json()) as Payload
    } catch {
        return jsonError('Expected a JSON body.', 400)
    }

    // Bots fill the hidden field; pretend it worked and send nothing.
    if (asTrimmedString(payload.honeypot, 50)) return json({ ok: true })

    const reason = asTrimmedString(payload.reason, 160)
    const details = asTrimmedString(payload.details, 4000)
    const host = HOSTS[asTrimmedString(payload.host, 20)] ?? 'Unknown'
    const browser = asTrimmedString(request.headers.get('User-Agent'), 300)

    if (!reason && !details) return jsonError('Please pick a reason or share a little feedback.', 400)

    const subject = `Chorus uninstall feedback (${host})`
    const body = [
        subject,
        '',
        `Extension: Chorus for ${host}`,
        `Reason: ${reason || 'Not specified'}`,
        `Browser: ${browser || 'unknown'}`,
        '',
        'Feedback:',
        details || 'No additional feedback provided.'
    ].join('\n')

    const response = await binding
        .fetch('https://email-worker/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body, replyEmail: '' })
        })
        .catch((error: unknown) => error)

    if (!(response instanceof Response) || !response.ok) {
        const detail = response instanceof Response ? `${response.status} ${await response.text()}` : String(response)
        console.error('Uninstall feedback email failed:', detail)
        return jsonError('Failed to send feedback. Please try again later.', 500)
    }

    return json({ ok: true })
}
