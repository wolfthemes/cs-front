import { useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import { Header, Footer, Main, SEO, ContactForm } from '../components';
import { SITE_CHROME_QUERY, siteChromeVariables } from '../fragments/SiteChrome';
import { useCopy } from '../lib/i18n';
import styles from '../components/ContactForm/ContactPage.module.scss';

export default function ContactPage() {
	const { contactPage: c } = useCopy();
	const { data } = useQuery(ContactPage.query, { variables: ContactPage.variables() });
	const siteTitle = data?.generalSettings?.title ?? 'constantin.saguin';
	const footerMenu = data?.footerMenuItems?.nodes ?? [];

	return (
		<>
			<SEO title={c.seo.title} description={c.seo.description} />
			<Header title={siteTitle} />
			<Main>
				<section className={styles.page}>
					<p className={styles.eyebrow}>{c.eyebrow}</p>
					<h1 className={styles.title}>{c.title}</h1>
					<p className={styles.lead}>{c.lead}</p>
					<ContactForm />
				</section>
			</Main>
			<Footer title={siteTitle} menuItems={footerMenu} />
		</>
	);
}

ContactPage.query = SITE_CHROME_QUERY;
ContactPage.variables = siteChromeVariables;

export function getStaticProps(ctx) {
	return getNextStaticProps(ctx, { Page: ContactPage });
}
