import nodemailer from 'nodemailer';

const TO = 'constantin@saguin.com';
const AUDIENCES = { client: 'Client', team: 'Team' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strip CR/LF so user input can never inject mail headers.
const oneLine = (value, max) =>
	String(value ?? '')
		.replace(/[\r\n]+/g, ' ')
		.trim()
		.slice(0, max);

// ponytail: no rate limit beyond the honeypot; add Upstash/Vercel KV limiting if spam shows up.
export default async function handler(req, res) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		return res.status(405).end();
	}

	const body = req.body ?? {};

	// Honeypot filled: pretend success so bots don't retry.
	if (body.website) return res.status(200).json({ ok: true });

	const name = oneLine(body.name, 100);
	const email = oneLine(body.email, 200);
	const topic = oneLine(body.topic, 150);
	const budget = oneLine(body.budget, 50);
	const company = oneLine(body.company, 100);
	// Allow-list: anything else is recorded as unspecified.
	const audience = Object.hasOwn(AUDIENCES, body.audience) ? body.audience : 'unspecified';
	const tag = AUDIENCES[audience] ?? 'Unspecified';
	const message = String(body.message ?? '')
		.trim()
		.slice(0, 5000);

	if (!name || !EMAIL_RE.test(email) || !topic || message.length < 10) {
		return res.status(400).json({ error: 'Invalid input' });
	}

	const { SMTP_HOST = 'smtp.migadu.com', SMTP_USER, SMTP_PASS } = process.env;
	// Local dev without credentials: log the message instead of failing.
	if ((!SMTP_USER || !SMTP_PASS) && process.env.NODE_ENV !== 'production') {
		console.log('Contact form (dev, not sent):', {
			name,
			email,
			topic,
			audience,
			company,
			budget,
			message,
		});
		return res.status(200).json({ ok: true });
	}
	if (!SMTP_USER || !SMTP_PASS) {
		console.error('Contact form: SMTP_USER / SMTP_PASS are not set');
		return res.status(500).json({ error: 'Not configured' });
	}

	try {
		const transport = nodemailer.createTransport({
			host: SMTP_HOST,
			port: 465,
			secure: true,
			auth: { user: SMTP_USER, pass: SMTP_PASS },
		});
		await transport.sendMail({
			from: `"Website contact form" <${SMTP_USER}>`,
			to: TO,
			replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
			subject: `[Site · ${tag}] ${topic}`,
			text: `Name: ${name}\nEmail: ${email}\nAudience: ${audience}\n${company ? `Company: ${company}\n` : ''}${budget ? `Budget: ${budget}\n` : ''}Language: ${oneLine(body.locale, 5)}\n\n${message}\n`,
		});
		return res.status(200).json({ ok: true });
	} catch (error) {
		console.error('Contact form: send failed', error);
		return res.status(502).json({ error: 'Send failed' });
	}
}
