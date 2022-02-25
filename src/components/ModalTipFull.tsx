import React from "react";
import styles from '../assets/styles/Name.module.scss'
import { Modal, Spin } from '@douyinfe/semi-ui';
interface RegProps {
  text: string;
  visible: boolean;
}
export const ModalTipFull: React.FC<RegProps> = ({ text, visible }) => {
  return (
    <Modal
      header={null}
      footer={null}
      visible={visible}
      centered={true}
      className={styles['pendingOrder-modal']}
    >
      <div className={styles['pendingOrder-modal-text']}>
        <Spin size="middle" /><p>{text}</p>
      </div>
    </Modal>
  )
}