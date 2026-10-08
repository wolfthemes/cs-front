import { useRouter } from 'next/router';
import { Header, Footer, Main, SEO, Services } from '../components';
import { useCopy } from '../lib/i18n';

// Static page: takes precedence over the WordPress catch-all, so no WP query
// is needed. Header/footer labels are fixed here instead of coming from WP menus.
const staticItem = (id, path, label) => ({
	__typename: 'MenuItem',
	id,
	path,
	label,
	parentId: null,
	cssClasses: [],
	target: null,
	menu: { node: { name: 'Primary' } },
});

export default function ServicesPage() {
	const { locale } = useRouter();
	const { services } = useCopy();
	const menu = [
		staticItem('home', '/', services.nav.home),
		staticItem('contact', '/contact', services.nav.contact),
	];

	return (
		<>
			<SEO
				title={services.seo.title}
				description={services.seo.description}
				url={`https://constantin.saguin.com${locale === 'fr' ? '/fr' : ''}/services`}
			/>
			<Header title="constantin.saguin" menuItems={menu} />
			<Main>
				<Services />
			</Main>
			<Footer title="constantin.saguin" menuItems={[]} />
		</>
	);
}
