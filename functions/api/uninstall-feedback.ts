// Cloudflare Pages Function: POST /api/uninstall-feedback, from the /uninstall and
// /youtube/uninstall forms (src/components/UninstallForm.astro). Sent from feedback@ through the
// EMAIL_WORKER binding; see src/lib/email-server.ts.
import {
    HOSTS,
    asStringArray,
    asTrimmedString,
    isValidEmail,
    json,
    jsonError,
    readJson,
    sendEmail,
    type Env
} from '../../src/lib/email-server'

type Payload = {
    host?: unknown
    version?: unknown
    browser?: unknown
    usedFor?: unknown
    reason?: unknown
    plan?: unknown
    details?: unknown
    replyEmail?: unknown
    honeypot?: unknown
}

const PLANS: Record<string, string> = {
    free: 'Free',
    'pro-trial': 'Chorus Pro (trial)',
    pro: 'Chorus Pro',
    'not-sure': 'Not sure',
    '': 'Not specified'
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
    const binding = env.EMAIL_WORKER
    if (!binding) return jsonError('Email backend is not configured yet.', 503)

    const payload = await readJson<Payload>(request)
    if (!payload) return jsonError('Expected a JSON body.', 400)

    // Bots fill the hidden field; pretend it worked and send nothing.
    if (asTrimmedString(payload.honeypot, 50)) return json({ ok: true })

    const host = HOSTS[asTrimmedString(payload.host, 20)] ?? 'Unknown'
    const version = asTrimmedString(payload.version, 40)
    const browser = asTrimmedString(payload.browser, 40)
    const usedFor = asStringArray(payload.usedFor, 8, 80)
    const reason = asTrimmedString(payload.reason, 160)
    const planKey = asTrimmedString(payload.plan, 20)
    const details = asTrimmedString(payload.details, 4000)
    const replyEmail = asTrimmedString(payload.replyEmail, 160)
    const userAgent = asTrimmedString(request.headers.get('User-Agent'), 300)

    if (!(planKey in PLANS)) return jsonError('Invalid plan selection.', 400)
    if (!reason && !details && usedFor.length === 0) {
        return jsonError('Please pick a reason or share a little feedback.', 400)
    }
    if (replyEmail && !isValidEmail(replyEmail)) return jsonError('Please check the email address.', 400)

    const subject = `Chorus uninstall feedback (${[host, browser].filter(Boolean).join(' · ')})`
    const body = [
        subject,
        '',
        `Extension: Chorus for ${host}`,
        `Version: ${version || 'unknown'}`,
        `Browser: ${browser || 'unknown'}`,
        `Used it for: ${usedFor.length ? usedFor.join(', ') : 'Not specified'}`,
        `Reason for uninstalling: ${reason || 'Not specified'}`,
        `Plan: ${PLANS[planKey]}`,
        `Reply email: ${replyEmail || 'Not provided'}`,
        '',
        'Feedback:',
        details || 'No additional feedback provided.',
        '',
        `User agent: ${userAgent || 'unknown'}`
    ].join('\n')

    if (!(await sendEmail(binding, { kind: 'feedback', subject, body, replyEmail }))) {
        return jsonError('Failed to send feedback. Please try again later.', 500)
    }
    return json({ ok: true })
}
