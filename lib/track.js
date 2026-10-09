// GA4 event; no-op when analytics isn't loaded (dev, previews, blocked).
export const track = (name, params) => {
	if (typeof window !== 'undefined') window.gtag?.('event', name, params);
};
