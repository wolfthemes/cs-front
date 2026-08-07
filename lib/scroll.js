import Lenis from 'lenis';

// Single Lenis-backed source of truth for page scroll. Scroll-reactive effects
// should read getScrollY() and subscribe to onScrollFrame() instead of each
// starting its own rAF and reading window.scrollY independently.

let lenis = null;
let raf = 0;
let lastY = 0;
let scrollY = 0;
let velocity = 0;
const subscribers = new Set();

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function readNativeScrollY() {
	return typeof window !== 'undefined' ? window.scrollY : 0;
}

export function getScrollY() {
	if (typeof window === 'undefined') return 0;
	if (lenis) return lenis.scroll;
	return scrollY || readNativeScrollY();
}

export function getScrollVelocity() {
	return velocity;
}

export function getLenis() {
	return lenis;
}

function publish(y) {
	scrollY = y;
	velocity = y - lastY;
	lastY = y;
	// Iterate the Set directly — this runs ~60fps for the page's life, and
	// subscribers don't add/remove during dispatch, so a per-frame copy is waste.
	for (const fn of subscribers) fn(scrollY, velocity);
}

function frame(time) {
	if (lenis) {
		lenis.raf(time);
		publish(lenis.scroll);
		raf = requestAnimationFrame(frame);
		return;
	}

	publish(readNativeScrollY());
	raf = subscribers.size ? requestAnimationFrame(frame) : 0;
}

function ensureFrame() {
	if (!raf) {
		lastY = getScrollY();
		scrollY = lastY;
		raf = requestAnimationFrame(frame);
	}
}

export function initSmoothScroll() {
	if (typeof window === 'undefined') return null;
	if (lenis || prefersReducedMotion()) return lenis;

	scrollY = readNativeScrollY();
	lastY = scrollY;
	velocity = 0;

	lenis = new Lenis({
		lerp: 0.09,
		wheelMultiplier: 0.9,
		touchMultiplier: 1.2,
		smoothWheel: true,
		syncTouch: false,
		autoRaf: false,
		anchors: false,
	});

	ensureFrame();
	return lenis;
}

export function destroySmoothScroll() {
	if (typeof window === 'undefined') return;
	if (raf) {
		cancelAnimationFrame(raf);
		raf = 0;
	}
	if (lenis) {
		lenis.destroy();
		lenis = null;
	}
	scrollY = readNativeScrollY();
	lastY = scrollY;
	velocity = 0;
}

export function resizeSmoothScroll() {
	if (lenis) lenis.resize();
}

export function scrollTo(target, options = {}) {
	if (typeof window === 'undefined') return;

	if (lenis) {
		lenis.scrollTo(target, options);
		return;
	}

	if (typeof target === 'number') {
		window.scrollTo({ top: target, behavior: options.immediate ? 'auto' : 'smooth' });
		return;
	}

	target?.scrollIntoView?.({ block: 'start', behavior: options.immediate ? 'auto' : 'smooth' });
}

// Subscribe a per-frame callback `fn(scrollY, velocity)`. Returns an unsubscribe
// function. When Lenis is active this shares its app-level rAF; otherwise it
// starts a native fallback loop only while subscribers exist.
export function onScrollFrame(fn) {
	subscribers.add(fn);
	ensureFrame();
	return () => {
		subscribers.delete(fn);
		if (!lenis && !subscribers.size && raf) {
			cancelAnimationFrame(raf);
			raf = 0;
		}
	};
}
