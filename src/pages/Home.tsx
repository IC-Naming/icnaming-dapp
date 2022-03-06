import React from 'react'
import { SearchInput } from "../components";
import styles from '../assets/styles/Home.module.scss';
import { useAnalytics } from '../utils/GoogleGA';
export const Home = () => {
  useAnalytics('Home');
  return (
    <div className={styles.home}>
      <div className="container">
        <div className={styles['home-logo']}></div>
        <SearchInput />
      </div>
    </div>
  );
}