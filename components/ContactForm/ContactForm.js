import { useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames/bind';
import styles from './ContactForm.module.scss';
import { useCopy } from '../../lib/i18n';
import { track } from '../../lib/track';

let cx = classNames.bind(styles);

const EMAIL = 'constantin@saguin.com';

// Posts to /api/contact. `website` is a honeypot: hidden from people, filled by
// bots, and silently dropped server-side.
export default function ContactForm() {
	const { contactPage: c, hero } = useCopy();
	const { query, locale } = useRouter();
	const [status, setStatus] = useState('idle'); // idle | sending | sent | error

	// Recruiters arrive via ?topic=Hiring (hero link): the budget field is for clients.
	const isHiring = query.topic === hero.hireTopic;

	const onSubmit = async (event) => {
		event.preventDefault();
		setStatus('sending');
		const data = Object.fromEntries(new FormData(event.currentTarget));
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...data, locale }),
			});
			setStatus(res.ok ? 'sent' : 'error');
			if (res.ok) track('contact_submit', { audience: isHiring ? 'employer' : 'client' });
		} catch {
			setStatus('error');
		}
	};

	if (status === 'sent') {
		return (
			<p className={cx('success')} role="status">
				{c.success}
			</p>
		);
	}

	return (
		<form className={cx('form')} onSubmit={onSubmit}>
			<div className={cx('row')}>
				<label className={cx('field')}>
					<span>{c.labels.name}</span>
					<input name="name" type="text" required maxLength={100} autoComplete="name" />
				</label>
				<label className={cx('field')}>
					<span>{c.labels.email}</span>
					<input name="email" type="email" required maxLength={200} autoComplete="email" />
				</label>
			</div>
			<div className={cx('row')}>
				<label className={cx('field')}>
					<span>{c.labels.topic}</span>
					<input
						name="topic"
						type="text"
						required
						maxLength={150}
						defaultValue={typeof query.topic === 'string' ? query.topic : c.defaultTopic}
					/>
				</label>
				{!isHiring && (
					<label className={cx('field')}>
						<span>{c.labels.budget}</span>
						<select name="budget" defaultValue={c.budgets[0]}>
							{c.budgets.map((b) => (
								<option key={b}>{b}</option>
							))}
						</select>
					</label>
				)}
			</div>
			<label className={cx('field')}>
				<span>{c.labels.message}</span>
				<textarea name="message" required minLength={10} maxLength={5000} rows={7} />
			</label>
			<input
				className={cx('trap')}
				name="website"
				tabIndex={-1}
				autoComplete="off"
				aria-hidden="true"
			/>
			<div className={cx('actions')}>
				<button className={cx('submit')} type="submit" disabled={status === 'sending'}>
					{status === 'sending' ? c.sending : c.submit}
				</button>
			</div>
			{status === 'error' && (
				<p className={cx('error')} role="alert">
					{c.error} <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
				</p>
			)}
			<p className={cx('alt')}>
				{c.preferEmail} <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
			</p>
		</form>
	);
}
