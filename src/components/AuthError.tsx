import { Modal } from "@douyinfe/semi-ui";
import styles from "assets/styles/AuthError.module.scss";
import { useAuthWallet } from "context/AuthWallet";
export interface IAuthErrorProps {
    visible: boolean;
    errDesc: string;
}
export const AuthError: React.FC<IAuthErrorProps> = ({ visible, errDesc }) => {
    const { ...authWallet } = useAuthWallet();
    const hide = () => {
        authWallet.setAuthErr({err:false,desc:''});
    }
    return (
        <Modal
            visible={visible}
            maskClosable={false}
            title="Notice"
            footer={null}
            onCancel={hide}
            className={styles['authError-modal']}
        >
            <div className="line-light mb-3"></div>
            <div className={styles['notice-main']}>
                {errDesc}
            </div>
            <div className={styles['notice-btn-wrap']}>
                <button className={styles['notice-btn']} onClick={hide}>close</button>
                <a target="_blank" rel="noreferrer" href="https://lake-reward-33f.notion.site/common-problem-51ec86f0eaec4886b4806ea8586933d6" className={styles['link-btn']} style={{marginLeft:10,display:'inline-block'}}>help</a>
            </div>
        </Modal>
    )
}