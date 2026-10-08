import { Header, Footer, Main, SEO, Services } from '../components';
import { useCopy } from '../lib/i18n';

// Static page: takes precedence over the WordPress catch-all, so no WP query is needed.
export default function ServicesPage() {
	const { services } = useCopy();

	return (
		<>
			<SEO title={services.seo.title} description={services.seo.description} />
			<Header title="constantin.saguin" />
			<Main>
				<Services />
			</Main>
			<Footer title="constantin.saguin" menuItems={[]} />
		</>
	);
}
