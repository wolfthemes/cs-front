import React from 'react';
import className from 'classnames/bind';
import { Signature } from '../../components';
import styles from './HomeHero.module.scss';

let cx = className.bind(styles);

export default function HomeHero() {
  return (
    <section className={cx('component')}>
      <Signature />
    </section>
  );
}
