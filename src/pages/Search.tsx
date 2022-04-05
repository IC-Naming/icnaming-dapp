import { useEffect, useState, useCallback } from 'react'
import { SearchInput, Card, CopyToClipboard } from "../components";
import PendingOrderCard from 'components/PendingOrderCard';
import styles from '../assets/styles/Search.module.scss'
import { Container, Tab, Tabs } from 'react-bootstrap';
import { Principal } from '@dfinity/principal';
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from '../utils/ServiceApi';
import dateFormat from "dateformat";
import { IC_EXTENSION } from '../utils/config';
import { CanisterError } from '../utils/exception';
import { isLocalEnv } from 'config/env';
import { GetNameOrderResponse } from 'utils/canisters/registrar/interface';
import toast from '@douyinfe/semi-ui/lib/es/toast';
import { queryWithCache } from 'utils/localCache';

interface NameModel {
	name: string;
	available: boolean;
	expireAt: string;
	favorite: boolean;
}

export const Search = (props) => {
	const { ...authWallet } = useAuthWallet();
	const [word, setWord] = useState<string | Principal>('')
	const [loading, setLoading] = useState<boolean>(true)
	const [isSearchAddress, setIsSearchAddress] = useState<boolean>(false)
	const [isNotIcp, setIsNotIcp] = useState<boolean>(false)
	const [notIcpword, setNotIcpword] = useState<string>('')
	const [nameSearchResult, setNameSearchResult] = useState<NameModel>();
	const [namesOfRegistrant, setNamesOfRegistrant] = useState<any>();
	const [namesOfController, setNamesOfController] = useState<any>();
	const [pendingOrderLoading, setPendingOrderLoading] = useState(false);
	const [existPendingOrderInfo, setExistPendingOrderInfo] = useState<GetNameOrderResponse>();


	const isInvalidPrincipal = (word: string) => {
		try {
			Principal.fromText(word);
			return true;
		}
		catch (e) {
			return false
		}
	}

	const creatNameSearchResult = useCallback(async (searchName, available) => {
		console.log('creatNameSearchResult start..........')
		// let expireAt = available ? '' : 'Expires ' + dateFormat(new Date(await serviceApi.expireAtOf(searchName)), "isoDateTime")
		let expireAt = '';
		if (available) {
			expireAt = '';
		} else {
			await (await ServiceApi.getInstance()).expireAtOf(searchName).then(res => {
				if (res) {
					expireAt = 'Expires ' + dateFormat(new Date(res), "isoDateTime")
				}
			}).catch(err => {
				if (err instanceof CanisterError) {
					expireAt = '';
				}
			})
		}
		let fav = false;
		if (authWallet.wallet?.principalId) {
			const myFavoriteNames = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
			fav = myFavoriteNames.some(item => item === searchName);
		}
		console.log({ name: searchName, available: available, expireAt, favorite: fav })
		setNameSearchResult({ name: searchName, available: available, expireAt, favorite: fav })
		setLoading(false)
	}, [authWallet.wallet]);

	const getPendingOrder = useCallback(async () => {
		if (!authWallet.wallet?.principalId) {
			return undefined;
		}
		setPendingOrderLoading(true);
		try {
			const res = await (await ServiceApi.getInstance()).getPendingOrder();
			if (res[0]) {
				return res[0];
			}
		} catch (err) {
			console.log('getPendingOrder', err);
		} finally {
			setPendingOrderLoading(false);
		}
		return undefined;
	}, [authWallet.wallet]);



	const handlWordChange = useCallback(async () => {
		const getMyFavourites = async () => {
			if (authWallet.wallet?.principalId) {
				let myFavoriteNamesStorage = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
				if (myFavoriteNamesStorage && myFavoriteNamesStorage.length > 0) {
					return myFavoriteNamesStorage;
				} else {
					return await queryWithCache(async () => {
						const favoriteNamesSevice = await (await ServiceApi.getInstance()).getFavoriteNames()
						localStorage.setItem('myFavoriteNames', JSON.stringify(favoriteNamesSevice))
						return (await ServiceApi.getInstance()).getFavoriteNames();
					}, 'myNamesOfFavorite' + authWallet.wallet.accountId);
				}
			} else {
				return [];
			}
		}
		if (word) {
			// if word is string
			if (typeof word === 'string') {
				let searchName = '';
				if (!word.endsWith('.')) {
					const wordDotSplitArray = word.split('.');
					const wordDotSplitCount = wordDotSplitArray.length;
					const nTLDs = wordDotSplitArray[wordDotSplitCount - 1];
					const envICP = isLocalEnv ? 'ticp' : 'icp';
					const isNotICP = nTLDs !== envICP;
					setIsNotIcp(isNotICP);
					if (wordDotSplitCount > 1 && isNotICP) {
						setLoading(false);
						setNotIcpword(nTLDs);
						return;
					} else if (wordDotSplitCount > 1 && !isNotICP) {
						searchName = word
					} else {
						setIsNotIcp(false);
						searchName = `${word}.${IC_EXTENSION}`
					}
				} else {
					setIsNotIcp(false);
					searchName = `${word}${IC_EXTENSION}`
				}
				try {
					const [userPendingOrder, available] = await Promise.all([getPendingOrder(), (await ServiceApi.getInstance()).available(searchName)]);
					if (userPendingOrder?.name === searchName) {
						setExistPendingOrderInfo(userPendingOrder);
						setLoading(false);
					} else {
						await creatNameSearchResult(searchName, available);
					}
				} catch (err) {
					if (err instanceof CanisterError) {
						if (err.code === 9) {
							creatNameSearchResult(searchName, false);
						} else {
							toast.error(err.message)
						}
					}
				}
			}
			// if word is principal
			else {
				let getNamesOfRegistrantLoaded = false;
				let getNamesOfControllerLoaded = false;
				(await ServiceApi.getInstance()).getNamesOfRegistrant(word).then(async res => {
					console.log("search address result of registation", res)
					// for each res ,map it to NameModel
					let myNamesOfFavorite = await getMyFavourites()
					let namesOfRegistrant = res.sort((a, b) => {
						return a.expired_at > b.expired_at ? -1 : 1
					}).map(item => {
						return {
							name: item.name,
							avaiable: false,
							expireAt: 'Expires ' + dateFormat(new Date(Number(item.expired_at)), "isoDateTime"),
							favorite: myNamesOfFavorite.includes(item.name)
						}
					})

					setNamesOfRegistrant(namesOfRegistrant)
					getNamesOfRegistrantLoaded = true;
					if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded) setLoading(false)
				}).catch(err => {
					console.log(err)
					setLoading(false)
				});
				(await ServiceApi.getInstance()).getNamesOfController(word).then(async res => {
					console.log("search address result of controller", res)
					// for each res ,map it to NameModel

					let myNamesOfFavorite = await getMyFavourites()
					let namesOfController = res.sort((a, b) => {
						return a > b ? 1 : -1
					}).map(item => {
						return {
							name: item,
							favorite: myNamesOfFavorite.includes(item)
						}
					})

					setNamesOfController(namesOfController)
					getNamesOfControllerLoaded = true;
					if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded) setLoading(false)
				}
				).catch(err => {
					console.log(err)
					setLoading(false)
				});
			}
		}
	}, [word, authWallet.wallet, creatNameSearchResult, getPendingOrder]);

	useEffect(() => {
		handlWordChange();
	}, [word, authWallet.wallet])// eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const wordParam = props.match.params.word;
		setLoading(true)
		if (isInvalidPrincipal(wordParam)) {
			setWord(Principal.fromText(wordParam))
			setIsSearchAddress(true)
		} else {
			setWord(wordParam)
			setIsSearchAddress(false)
		}
	}, [props.match.params.word])// eslint-disable-line react-hooks/exhaustive-deps
	return (
		<div className={styles.serach}>
			<div className="container pt-5">
				<div className={styles['serach-content']}>
					<SearchInput word={typeof word === 'string' ? word : word.toText()} />
					<Container className={`pt-5`}>
						{
							(loading || pendingOrderLoading) ?
								<div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>
								:
								<>
									{
										!isSearchAddress
											? <div className={styles['search-name']}><span>{word}</span></div>
											:
											<div className={styles['search-address']}>
												<span className={styles.icon}><i className="bi bi-person"></i></span>
												<span className={styles.address}>{`${word}`}</span>
												<CopyToClipboard text={word} />
											</div>
									}
									<div className={styles['search-result']}>
										{

											!isSearchAddress ?
												isNotIcp ?
													<div className={styles.noicp}>
														.{notIcpword} DNSSEC support coming soon!
													</div>
													:
													<div className={styles.list}>
														{
															existPendingOrderInfo ?
																<PendingOrderCard order={existPendingOrderInfo}></PendingOrderCard>
																:
																<Card name={nameSearchResult?.name || ''}
																	expireAt={nameSearchResult?.expireAt || ''}
																	available={nameSearchResult?.available || false}
																	favorite={nameSearchResult?.favorite || false} />
														}

													</div>
												:
												<Tabs defaultActiveKey="registrant" className="mb-3">
													<Tab eventKey="registrant" title="Registrant">
														{
															namesOfRegistrant && namesOfRegistrant.length > 0 ?
																<div className={styles.list}>
																	{
																		namesOfRegistrant?.map((item, index) => {
																			return <Card key={index} name={`${item.name}`}
																				expireAt={item?.expireAt}
																				available={item.available}
																				favorite={item.favorite} />
																		})
																	}
																</div>
																:
																<div className="nodata"><span>No search results</span></div>
														}
													</Tab>
													<Tab eventKey="controller" title="Controller">
														{
															namesOfController && namesOfController.length > 0 ?
																<div className={styles.list}>
																	{
																		namesOfController?.map((item, index) => {
																			return <Card key={index} name={`${item.name}`} expireAt="" available={item.available} favorite={item.favorite} />
																		})
																	}
																</div>
																:
																<div className="nodata"><span>No search results</span></div>
														}
													</Tab>
												</Tabs>
										}
									</div>
								</>
						}
					</Container>
				</div>
			</div>
		</div >
	)
}
