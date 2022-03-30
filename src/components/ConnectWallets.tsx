import React from "react";
import logoipc from '../assets/images/icplogo.png';
import plugimg from '../assets/images/pluglogo.png';
import stoicwallet from '../assets/images/stoicwallet.png';
import styles from "../assets/styles/ConnectWallets.module.scss";
import { Row, Col, Modal, Spinner } from "react-bootstrap";
import { useAuthWallet } from "../context/AuthWallet";
import toast from "@douyinfe/semi-ui/lib/es/toast";

interface propsType {
	visible: boolean;
	hide: () => void;
}
export const ConnectWallets: React.FC<propsType> = ({ visible, hide }) => {
	const { ...authWallet } = useAuthWallet()
	const [connecting, setConnecting] = React.useState<boolean>(false)
	const connPlugWallet = () => {
		setConnecting(true)
		authWallet.connectPlugWallet().then(async (res: any) => {
			setConnecting(false)
			if (res && res.connected) {
				hide()
			} else {
				toast.error('fail connect')
			}
		}).catch(err => {
			hide();
			toast.error(err)
		}).finally(() => {
			setConnecting(false)
		});
	}

	const connectIIWallet = () => {
		setConnecting(true)
		authWallet.connectII().then((res: any) => {
			setConnecting(false)
			if (res && res.connected) {
				hide()
			} else {
				toast.error('fail connect')
			}
		})
	}

	const connectStiocWallet = () => {
		setConnecting(true)
		authWallet.connectStoic().then((res: any) => {
			setConnecting(false)
			if (res && res.connected) {
				hide()
			} else {
				toast.error('fail connect')
			}
		}).catch(err => {
			hide();
		}).finally(() => {
			setConnecting(false)
		});
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
				<Modal.Title className="fz-18 connectwallettitle">Select a Wallet</Modal.Title>
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
									<button className={styles["btn-connect"]} onClick={connectIIWallet} disabled={connecting}>
										<img src={logoipc} alt="ipc" />
										<span>Internet Identity</span>
									</button>
								</Col>
								<Col sm="12">
									<button className={styles["btn-connect"]} onClick={connPlugWallet} disabled={connecting}>
										<img src={plugimg} alt="plug" />
										<span>Plug</span>
									</button>
								</Col>
								<Col sm="12">
									<button className={styles["btn-connect"]} onClick={connectStiocWallet} disabled={connecting}>
										<img src={stoicwallet} alt="stioc" />
										<span>Stioc Wallet</span>
									</button>
								</Col>
							</Row>
						</React.Fragment>
				}
			</Modal.Body>
		</Modal>
	);
};