// Cloudflare Pages Function: POST /api/support, from the /support form. Sent from support@
// through the EMAIL_WORKER binding with Reply-To set to the sender, so a reply goes straight back.
import { HOSTS, asTrimmedString, isValidEmail, json, jsonError, readJson, sendEmail, type Env } from '../../src/lib/email-server'
import { SUPPORT_TOPICS } from '../../src/lib/site'

type Payload = {
    host?: unknown
    topic?: unknown
    subject?: unknown
    email?: unknown
    message?: unknown
    version?: unknown
    browser?: unknown
    pageUrl?: unknown
    honeypot?: unknown
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
    const binding = env.EMAIL_WORKER
    if (!binding) return jsonError('Email backend is not configured yet.', 503)

    const payload = await readJson<Payload>(request)
    if (!payload) return jsonError('Expected a JSON body.', 400)

    if (asTrimmedString(payload.honeypot, 50)) return json({ ok: true })

    const hostKey = asTrimmedString(payload.host, 20)
    const host = HOSTS[hostKey] ?? 'Not sure'
    const topic = asTrimmedString(payload.topic, 60)
    const title = asTrimmedString(payload.subject, 160)
    const email = asTrimmedString(payload.email, 160)
    const message = asTrimmedString(payload.message, 4000)
    const version = asTrimmedString(payload.version, 40)
    const browser = asTrimmedString(payload.browser, 40)
    const pageUrl = asTrimmedString(payload.pageUrl, 400)
    const userAgent = asTrimmedString(request.headers.get('User-Agent'), 300)

    if (topic && !SUPPORT_TOPICS.includes(topic)) return jsonError('Invalid topic.', 400)
    if (!email || !isValidEmail(email)) return jsonError('Please give an email address we can reply to.', 400)
    if (!message) return jsonError('Please tell us a little about what happened.', 400)

    const subject = `Chorus support: ${title || topic || 'General question'} (${host})`
    const body = [
        'Chorus support request',
        '',
        `Extension: ${HOSTS[hostKey] ? `Chorus for ${host}` : 'Not sure'}`,
        `Topic: ${topic || 'Not specified'}`,
        `Subject: ${title || 'Not specified'}`,
        `Reply email: ${email}`,
        `Version: ${version || 'unknown'}`,
        `Browser: ${browser || 'unknown'}`,
        `Page: ${pageUrl || 'unknown'}`,
        '',
        'Message:',
        message,
        '',
        `User agent: ${userAgent || 'unknown'}`
    ].join('\n')

    if (!(await sendEmail(binding, { kind: 'support', subject, body, replyEmail: email }))) {
        return jsonError('Failed to send your message. Please try again later.', 500)
    }
    return json({ ok: true })
}
