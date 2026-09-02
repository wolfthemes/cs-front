import className from 'classnames/bind';
import { SafeHtml } from '../SafeHtml';
import styles from './ContentWrapper.module.scss';

let cx = className.bind(styles);

export default function ContentWrapper({ content, children, className }) {
	return (
		<article className={cx(['component', className])}>
			<SafeHtml html={content ?? ''} />
			{children}
		</article>
	);
}
