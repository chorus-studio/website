// Sends the site's emails (uninstall feedback today) to the Chorus inbox. Called only by the
// Pages Function through the EMAIL_WORKER service binding: POST /send { subject, body, replyEmail }.
import { EmailMessage } from 'cloudflare:email'

interface Env {
    SEND_EMAIL: { send(message: EmailMessage): Promise<void> }
    /** An address on chorusstudio.org (wrangler.toml); it doesn't need a mailbox. */
    SENDER: string
    /** A verified Email Routing destination, set with `wrangler secret put RECIPIENT`. */
    RECIPIENT?: string
}

type Payload = { subject?: unknown; body?: unknown; replyEmail?: unknown }

/** Header values can't carry line breaks, or they could add headers of their own. */
const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim()

function buildRawEmail(from: string, to: string, subject: string, body: string, replyEmail: string) {
    const headers = [
        `From: Chorus <${from}>`,
        `To: ${to}`,
        `Subject: ${oneLine(subject)}`,
        `Date: ${new Date().toUTCString()}`,
        `Message-ID: <${crypto.randomUUID()}@chorusstudio.org>`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit'
    ]
    if (replyEmail) headers.push(`Reply-To: ${oneLine(replyEmail)}`)

    return `${headers.join('\r\n')}\r\n\r\n${body.replace(/\r?\n/g, '\r\n')}`
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
        if (!env.RECIPIENT) return Response.json({ ok: false, error: 'RECIPIENT is not set' }, { status: 503 })

        let payload: Payload
        try {
            payload = (await request.json()) as Payload
        } catch {
            return Response.json({ ok: false, error: 'Expected a JSON body' }, { status: 400 })
        }

        const subject = typeof payload.subject === 'string' ? payload.subject : ''
        const body = typeof payload.body === 'string' ? payload.body : ''
        const replyEmail = typeof payload.replyEmail === 'string' ? payload.replyEmail : ''
        if (!subject || !body) return Response.json({ ok: false, error: 'Missing subject or body' }, { status: 400 })

        try {
            const raw = buildRawEmail(env.SENDER, env.RECIPIENT, subject, body, replyEmail)
            await env.SEND_EMAIL.send(new EmailMessage(env.SENDER, env.RECIPIENT, raw))
        } catch (error) {
            console.error('Email worker error:', error)
            return Response.json({ ok: false, error: 'Failed to send email' }, { status: 500 })
        }

        return Response.json({ ok: true })
    }
}
