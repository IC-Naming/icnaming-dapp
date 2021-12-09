import React from 'react'
import styles from "../assets/styles/Press.module.scss";
import logo1 from "../assets/images/press/logo-512.png";
import logo2 from "../assets/images/press/ICNAMING2_w.png";
import logo3 from "../assets/images/press/ICNAMING2_w_h.png";
import press from "../assets/images/press/press.zip";

import { Link } from 'react-router-dom'
export const Press = () => {
  return (
    <div className={styles['press-wrap']}>
      <div className="container">
        <div className={styles.mybreadcrumb}>
          <Link to="/">Home</Link>
          <span>Press kit</span>
        </div>
        <div className={styles['press-content']}>
          <h1>ICNAMING</h1>
          <h2>The ICNAMING logo</h2>
          <div className="row">
            <div className="col-md-4">
              <a className={`${styles['img-logo']} img-fluid`} href={press}>
                <div className={styles['img-w']}><img className="img-fluid" alt="ICNAMING Logo" style={{height:'60%'}} src={logo1} /></div>
                <div>
                  <strong>ICNAMING logo</strong> <i className={styles["icon-download"]}></i>
                </div>
              </a>
            </div>
            <div className="col-md-4">
              <a className={`${styles['img-logo']} img-fluid`} href={press}>
                <div className={styles['img-w']}><img className="img-fluid" alt="ICNAMING Logo" style={{height:'60%'}} src={logo2} /></div>
                <div>
                  <strong>ICNAMING logo</strong> <i className={styles["icon-download"]}></i>
                </div>
              </a>
            </div>
            <div className="col-md-4">
              <a className={`${styles['img-logo']} img-fluid`} href={press}>
                <div className={styles['img-w']}><img className="img-fluid" alt="ICNAMING Logo" src={logo3} /></div>
                <div>
                  <strong>ICNAMING logo</strong> <i className={styles["icon-download"]}></i>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
