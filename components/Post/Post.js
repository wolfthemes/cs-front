import Link from 'next/link';
import { FeaturedImage } from '../FeaturedImage';
import { PostInfo } from '../PostInfo';
import { SafeHtml } from '../SafeHtml';
import styles from './Post.module.scss';

export default function Post({ title, content, date, author, uri, featuredImage }) {
	return (
		<article className={styles.component}>
			{featuredImage && (
				<Link legacyBehavior href={uri}>
					<a>
						<FeaturedImage
							image={featuredImage}
							layout="responsive"
							className={styles.featuredImage}
						/>
					</a>
				</Link>
			)}

			<Link legacyBehavior href={uri}>
				<a>
					<h2>{title}</h2>
				</a>
			</Link>
			<PostInfo date={date} author={author} className={styles.postInfo} />
			<SafeHtml className={styles.content} html={content} />
		</article>
	);
}
