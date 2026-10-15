import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames/bind';
import styles from './ContactForm.module.scss';
import { useCopy } from '../../lib/i18n';
import { track } from '../../lib/track';

let cx = classNames.bind(styles);

const EMAIL = 'constantin@saguin.com';
const AUDIENCES = ['client', 'team'];

// Posts to /api/contact. `website` is a honeypot: hidden from people, filled by
// bots, and silently dropped server-side.
export default function ContactForm() {
	const { contactPage: c } = useCopy();
	const { query, locale, isReady } = useRouter();
	const [status, setStatus] = useState('idle'); // idle | sending | sent | error
	// '' until chosen: links pre-select it with ?for=client|team, direct visits must pick.
	const [audience, setAudience] = useState('');

	// Static page: the query is empty on first render, so apply ?for= once it is ready.
	useEffect(() => {
		if (isReady && AUDIENCES.includes(query.for)) setAudience(query.for);
	}, [isReady, query.for]);

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
			if (res.ok) track('contact_submit', { audience });
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
			<fieldset className={cx('choice')}>
				<legend>{c.labels.audience}</legend>
				{AUDIENCES.map((value) => (
					<label key={value} className={cx('pill', { 'is-checked': audience === value })}>
						<input
							type="radio"
							name="audience"
							value={value}
							required
							checked={audience === value}
							onChange={() => setAudience(value)}
						/>
						{c.audiences[value]}
					</label>
				))}
			</fieldset>
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
						key={query.topic}
						name="topic"
						type="text"
						required
						maxLength={150}
						defaultValue={typeof query.topic === 'string' ? query.topic : c.defaultTopic}
					/>
				</label>
				{audience === 'client' && (
					<label className={cx('field')}>
						<span>{c.labels.budget}</span>
						<select name="budget" defaultValue={c.budgets[0]}>
							{c.budgets.map((b) => (
								<option key={b}>{b}</option>
							))}
						</select>
					</label>
				)}
				{audience === 'team' && (
					<label className={cx('field')}>
						<span>{c.labels.company}</span>
						<input name="company" type="text" maxLength={100} autoComplete="organization" />
					</label>
				)}
			</div>
			<label className={cx('field')}>
				<span>{audience === 'team' ? c.labels.messageTeam : c.labels.message}</span>
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
