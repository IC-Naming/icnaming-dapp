import React from "react";
import logoIpc from '../assets/images/icplogo.png';
import plugImg from '../assets/images/pluglogo.png';
import stoicWallet from '../assets/images/stoicwallet.png';
import styles from "../assets/styles/ConnectWallets.module.scss";
import { Row, Col, Modal, Spinner } from "react-bootstrap";
import { useAuthWallet } from "../context/AuthWallet";
import toast from "@douyinfe/semi-ui/lib/es/toast";
import { WalletType } from "utils/connector";
const u = navigator.userAgent;
const isMobile = !!u.match(/AppleWebKit.*Mobile.*/);
/* const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); */
interface propsType {
	visible: boolean;
	hide: () => void;
}
export const ConnectWallets: React.FC<propsType> = ({ visible, hide }) => {
	const { ...authWallet } = useAuthWallet()
	const [connecting, setConnecting] = React.useState<boolean>(false)
	const connectWallet = async (walletType: WalletType) => {
		setConnecting(true)
		if(walletType === 2){
			localStorage.removeItem("_scApp");
		}
		try {
			const connectResult: any = await authWallet.connectWallet(walletType);
			if (connectResult === true) {
				hide();
				setConnecting(false)
			}
		} catch (error) {
			console.log(error)
			toast.error('connect error')
		}
	}

	return (
		<Modal
			show={visible}
			onHide={() => {
				hide()
				setConnecting(false)
			}}
		>
			<Modal.Header>
				<Modal.Title className="fz-18 connectWalletTitle">Select a Wallet</Modal.Title>
				<button className='close' onClick={() => {
					hide()
					setConnecting(false)
				}}>
					<i className="bi bi-x-circle"></i>
				</button>
			</Modal.Header>
			<Modal.Body>
				<div className="line-light mb-3"></div>
				{
					connecting ?
						<Row>
							<Col sm="12">
								<div className="text-center modal-text-color p-5">
									Connecting Wallets <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />
								</div>
							</Col>
						</Row>
						:
						<React.Fragment>
							<div className="mb-4 modal-text-color">Please select a wallet to connect to this dapp:</div>
							<Row>
								<Col sm="12">
									<button className={styles["btn-connect"]} onClick={() => { connectWallet(0) }} disabled={connecting}>
										<img src={logoIpc} alt="Nns" />
										<span>Internet Identity</span>
									</button>
								</Col>
								{
									!isMobile && <Col sm="12">
										<button className={styles["btn-connect"]} onClick={() => { connectWallet(1) }} disabled={connecting}>
											<img src={plugImg} alt="Plug" />
											<span>Plug</span>
										</button>
									</Col>
								}
								<Col sm="12">
									<button className={styles["btn-connect"]} onClick={() => { connectWallet(2) }} disabled={connecting}>
										<img src={stoicWallet} alt="Stoic" />
										<span>Stoic Wallet</span>
									</button>
								</Col>
							</Row>
						</React.Fragment>
				}
			</Modal.Body>
		</Modal>
	);
};