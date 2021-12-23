import styles from '../assets/styles/Footer.module.scss'
import { isMainNetEnv } from "../utils/config";
export const Footer = () => {
  return (
    <footer className={`${styles["footer"]} app-footer`}>
      <div className="container-xxl">
        <div className={`${styles['footer-inner']} row`}>
          <div className={`${styles.copyright} col-lg-6 col-md-6 col-sm-6`}>
            <div className={styles.logo}>icnaming</div>
          </div>
          <div className={`${styles['social-media']} col-lg-6 col-md-6 col-sm-6`}>
            <a href="https://twitter.com/ic_naming" className={`${styles['icon']} ${styles['icon-twitter']}`}>Twitter</a>
            <a href="https://medium.com/@icnaming" className={`${styles['icon']} ${styles['icon-medium']}`}>Medium</a>
            <a href="https://github.com/IC-Naming" className={`${styles['icon']} ${styles['icon-github']}`}>Github</a>
            <a href="https://discord.gg/FJ63ckXn6n" className={`${styles['icon']} ${styles['icon-discord']}`}>Discord</a>
            <span className={styles.divider}></span>
            <a href={
              isMainNetEnv() ? "https://icnaming.com/presskit": "https://testnet.icnaming.com/presskit"
            } className={`${styles['icon']} ${styles['icon-press']}`} title="press kit">press kit</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


