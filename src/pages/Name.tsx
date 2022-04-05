import React from 'react';
import { Container, Tabs, Tab, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { SearchInput, CopyToClipboard, Record, Register, ConnectWallets } from "../components";
import styles from "../assets/styles/Name.module.scss";
import ServiceApi, { NameDetails } from "../utils/ServiceApi";
import { queryWithCache } from '../utils/localCache';
import { CanisterError } from "../utils/exception";
import toast from "@douyinfe/semi-ui/lib/es/toast";
import { Skeleton } from "@douyinfe/semi-ui";
export const Name = (props) => {
	const location = useLocation();
	const showBackMyAccountLink = location.search?.match(/from=([a-zA-Z]+)[&|\b]?/)?.[1] === 'myaccount';
	const showBackFavLink = location.search?.match(/from=([a-zA-Z]+)[&|\b]?/)?.[1] === 'favourites';
	const [showWallets, setShowWallets] = useState<boolean>(false);
	const [name, setName] = useState<string>('');
	const [loadingName, setLoadingName] = useState<boolean>(true);
	const [nameDetails, setNameDetails] = useState<NameDetails>({
		name: 'ICP',
		available: true,
		registrant: "Not owned",
		controller: "Not owned",
		resolver: "No Resolver set",
		expireAt: "No Expire set",
	});

	const [recordsAddress, setRecordsAddress] = useState([
		{ title: 'ICP', key: 'token.icp', value: "Not set" },
		{ title: 'BTC', key: 'token.btc', value: "Not set" },
		{ title: 'ETH', key: 'token.eth', value: "Not set" },
		{ title: 'LTC', key: 'token.ltc', value: "Not set" },
	]);

	const [recordsText, setRecordsText] = useState([
		{ title: 'Email', key: 'email', value: "Not set" },
		{ title: 'Avatar', key: 'avatar', value: "Not set" },
		{ title: 'Url', key: 'url', value: "Not set" },
		{ title: 'Description', key: 'description', value: "Not set" },
		{ title: 'Notice', key: 'notice', value: "Not set" },
		{ title: 'Keywords', key: 'keywords', value: "Not set" },
		{ title: 'Twitter', key: 'com.twitter', value: "Not set" },
		{ title: 'Github', key: 'com.github', value: "Not set" },
	]);

	const [canister, setCanister] = useState<any>();
	const [action, setAction] = useState('details');

	useEffect(() => {
		const ac = new AbortController();
		if (name !== '') {
			let getNameDetailsLoaded = false;
			let getRecordsOfNameLoaded = false;
			(async () => {
				(await ServiceApi.getInstance()).getNameDetails(name).then(res => {
					// console.log('details', res)
					setNameDetails(res);
					getNameDetailsLoaded = true;
					if (getNameDetailsLoaded && getRecordsOfNameLoaded) {
						setLoadingName(false);
					}
				}).catch(err => {
					if (err in CanisterError) {
						toast.error(err.message);
					}
					setLoadingName(false);
					toast.error('Get name details failed');
				});
			})();
			queryWithCache(() => {
				return new Promise(async (resolve, reject) => {
					(await ServiceApi.getInstance()).getRecordsOfName(name).then(data => {
						resolve(data)
					}).catch(errs => {
						reject(errs)
					});
				})
			}, name + 'Records', 30).then(res => {
				const records = recordsAddress.map(item => {
					const record = res.find(record => {
						console.log(record)
						return record[0] === item.key
					}
					);
					return record ? { title: item.title, key: item.key, value: record[1] } : { title: item.title, key: item.key, value: "" };
				})
				setRecordsAddress(records);

				const textRecords = recordsText.map(item => {
					const record = res.find(record => record[0] === item.key);
					return record ? { title: item.title, key: item.key, value: record[1] } : { title: item.title, key: item.key, value: "" };
				})
				setRecordsText(textRecords)

				const canister = res.find(record => record[0] === 'canister.icp');
				canister ? setCanister(canister[1]) : setCanister("");
				getRecordsOfNameLoaded = true;
				if (getNameDetailsLoaded && getRecordsOfNameLoaded) {
					setLoadingName(false);
				}
			}).catch(err => {
				console.log(err)
				setLoadingName(false);
				toast.error('Get records of name failed');
			})
		}
		return () => ac.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name])

	useEffect(() => {
		console.log(props.match.params)
		setName(props.match.params.name || "")
		if (props.match.params.action) {
			setAction(props.match.params.action)
		} else {
			setAction("details")
		}
		return () => {
			setName('')
			setAction('')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.match.params])

	const nameDetailsSkeleton = (
		<>
			<div style={{ display: 'flex', alignItems: 'center', width: '50%', marginBottom: '2rem' }}>
				<Skeleton.Title style={{ width: '100%', height: 32 }} />
			</div>
			<div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
				<Skeleton.Button style={{ marginRight: 5 }} />
				<Skeleton.Button />
			</div>
			<div className={styles['skeleton-pargraph']}>
				{
					Array.from({ length: 5 }).map((item, index) => <div key={index} className={styles['skeleton-pargraph-item']}><Skeleton.Title style={{ width: '20%', height: 32 }} /><Skeleton.Title style={{ width: '77%', height: 32 }} /></div>)
				}
			</div>
		</>
	)
	return (
		<div className={styles['name-wrap']}>
			<div className="container pt-5">
				<div className={styles['name-content']}>
					<SearchInput word="" />
					<Container className="pt-5">
						{
							loadingName ?
								<Skeleton placeholder={nameDetailsSkeleton} loading={true} style={{ width: '100%' }} active>
									<span className={styles.icon}><i className="bi bi-person"></i></span>
								</Skeleton>
								:
								<React.Fragment>
									<h1 className={`${styles.title} text-right`}>
										{
											showBackMyAccountLink &&
											<Link to='/myaccount' className={styles['name-back-link']}>
												<i className="bi bi-chevron-left"></i>
											</Link>
										}
										{
											showBackFavLink &&
											<Link to='/favourites' className={styles['name-back-link']}>
												<i className="bi bi-chevron-left"></i>
											</Link>
										}
										{name}
									</h1>
									<Tabs activeKey={action} onSelect={(k) => setAction(k || "register")} className="mb-3">
										<Tab eventKey="reg" title="Register">
											<Register regname={props.match.params.name} available={nameDetails?.available} />
										</Tab>
										<Tab eventKey="details" title="Details">
											<div className={styles.details}>
												<div className={styles.flexrow}>
													<div className={styles.flexcol}>Parent</div>
													<div className={styles.flexcol}>{nameDetails?.name}</div>
												</div>
												<div className={`${styles['details-main']} ${styles.detailsopt}`}>
													<div className={styles.flexrow}>
														<div className={styles.flexcol}>Registrant</div>
														<div className={styles.flexcol}>
															<span className={styles['d-text']}>{nameDetails?.registrant}</span>
															<CopyToClipboard text={nameDetails?.registrant} />
														</div>
														<div className={styles.flexcol}>
															<OverlayTrigger trigger="click"
																overlay={<Tooltip className={styles.commingTip}>Coming soon</Tooltip>}
															>
																<button className={styles.btn}>Transfer</button>
															</OverlayTrigger>
														</div>
													</div>
													<div className={styles.flexrow}>
														<div className={styles.flexcol}>Controller</div>
														<div className={styles.flexcol}>
															<span className={styles['d-text']}>{nameDetails?.controller}</span>
															<CopyToClipboard text={nameDetails?.controller} />
														</div>
														<div className={styles.flexcol}>
															<OverlayTrigger trigger="click"
																overlay={<Tooltip className={styles.commingTip}>Coming soon</Tooltip>}
															>
																<button className={styles.btn}>Transfer</button>
															</OverlayTrigger>
														</div>
													</div>
													<div className={styles.flexrow}>
														<div className={styles.flexcol}>Expiration Date</div>
														<div className={styles.flexcol}>{nameDetails?.expireAt.toString()}</div>
														<div className={styles.flexcol}>
															<OverlayTrigger trigger="click"
																overlay={<Tooltip className={styles.commingTip}>Coming soon</Tooltip>}
															>
																<button className={styles.btn}>Renew</button>
															</OverlayTrigger>
														</div>
													</div>
													<div className={styles.flexrow}>
														<div className={styles.flexcol}>Resolver</div>
														<div className={styles.flexcol}>
															<span className={styles['d-text']}>{nameDetails?.resolver}</span>
															<CopyToClipboard text={nameDetails?.resolver} />
														</div>
														<div className={styles.flexcol}>
															<OverlayTrigger trigger="click"
																overlay={<Tooltip className={styles.commingTip}>Coming soon</Tooltip>}
															>
																<button className={styles.btn}>Set</button>
															</OverlayTrigger>
														</div>
													</div>
												</div>
												<div className={`${styles['details-main']} ${styles.records}`}>
													<h2 className={styles['records-tltle']}>Records</h2>
													<div className="line-light"></div>
													<h3 className={`${styles['records-subtitle']} mt-2`}>Address</h3>
													{
														recordsAddress.map((item, index) => {
															return (
																<Record key={index}
																	name={name}
																	title={item.title}
																	recordKey={item.key}
																	value={item.value}
																	registant={nameDetails?.registrant}
																	controller={nameDetails?.controller}
																/>
															)
														})
													}
													<div className="line-light"></div>
													<h3 className={styles['records-subtitle']}>Canister</h3>
													<Record name={name} value={canister} title='Canister' recordKey='canister.icp' registant={nameDetails?.registrant} controller={nameDetails?.controller} />
													<div className="line-light"></div>
													<h3 className={styles['records-subtitle']}>Text Record</h3>
													{
														recordsText.map((item, index) => {
															return (
																<Record key={index} name={name} title={item.title} recordKey={item.key}
																	value={item.value} registant={nameDetails?.registrant} controller={nameDetails?.controller} />
															)
														})
													}
												</div>
											</div>
										</Tab>
									</Tabs>
								</React.Fragment>
						}
					</Container>
				</div>
			</div>
			<ConnectWallets visible={showWallets} hide={() => { setShowWallets(false) }} />
		</div >
	)
}