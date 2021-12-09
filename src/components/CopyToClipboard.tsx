import Copy from 'copy-to-clipboard';
import styles from '../assets/styles/CopyToClipboard.module.scss'
import { useState } from 'react';

export const CopyToClipboard = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copyfunc = () => {
    Copy(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }
  return (
    <span className={styles['btn-copy']}>
      {!copied ?
        <i className="bi bi-files" onClick={copyfunc}></i>
        :
        <span className={styles['Clipboard']}>Clipboard</span>}
    </span>
  );
};