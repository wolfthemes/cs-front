import classNames from 'classnames/bind';
import { Container, NavigationMenu } from '../../components';
import { useCopy } from '../../lib/i18n';
import styles from './Footer.module.scss';

let cx = classNames.bind(styles);

export default function Footer({ title, menuItems }) {
	const { footer } = useCopy();
	const year = new Date().getFullYear();

	return (
		<footer className={cx('component')}>
			<Container>
				<NavigationMenu className={cx('nav')} menuItems={menuItems} />
				<p className={cx('copyright')}>{`${title} © ${year}. ${footer}`}</p>
			</Container>
		</footer>
	);
}
