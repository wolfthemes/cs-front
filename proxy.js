import { NextResponse } from 'next/server';

// Geo-detect French visitors on the bare home URL and send them to /fr, once.
// The redirect sets NEXT_LOCALE, so later visits to / (e.g. after clicking EN)
// are never redirected again. The EN | FR toggle sets the same cookie.
// ponytail: Vercel's x-vercel-ip-country header; no header (local dev) = no redirect.
// The matcher '/' also matches /fr (locale prefixes are stripped before matching),
// so only the English home may redirect; otherwise a cookieless client from France
// (a crawler, a first visit) loops /fr -> /fr forever. Crawlers are never redirected.
export function proxy(request) {
	if (request.nextUrl.locale !== 'en') return NextResponse.next();
	if (request.cookies.has('NEXT_LOCALE')) return NextResponse.next();
	if (/bot|crawl|spider|google/i.test(request.headers.get('user-agent') ?? ''))
		return NextResponse.next();
	if (request.headers.get('x-vercel-ip-country') === 'FR') {
		const response = NextResponse.redirect(new URL('/fr', request.url));
		response.cookies.set('NEXT_LOCALE', 'fr', {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			sameSite: 'lax',
		});
		return response;
	}
	return NextResponse.next();
}

export const config = { matcher: '/' };
