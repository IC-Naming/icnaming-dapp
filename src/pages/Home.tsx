import React from 'react'
import { SearchInput } from "../components";
import styles from '../assets/styles/Home.module.scss'
export const Home = () => {
  return (
    <div className={styles.home}>
      <div className="container">
        <div className={styles['home-logo']}></div>
        <SearchInput />
      </div>
    </div>
  );
}