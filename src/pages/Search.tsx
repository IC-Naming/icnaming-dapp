import React, { useEffect, useState } from 'react'
import { SearchInput, Card, CopyToClipboard } from "../components";
import styles from '../assets/styles/Search.module.scss'
import { Container, Tab, Tabs } from 'react-bootstrap';
import { Principal } from '@dfinity/principal';
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from '../utils/ServiceApi';
import dateFormat from "dateformat";
import { IC_EXTENSION } from '../utils/config';
import { CanisterError } from '../utils/exception';
import { toast } from 'react-toastify';

interface NameModel {
  name: string;
  available: boolean;
  expireAt: string;
  favorite: boolean;
}
export const Search = (props) => {
  const { ...authWallet } = useAuthWallet();
  const serviceApi = new ServiceApi();
  const [word, setWord] = useState<string | Principal>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [isSearchAddress, setIsSearchAddress] = useState<boolean>(false)
  const [isNotIcp, setIsNotIcp] = useState<boolean>(false)
  const [notIcpword, setNotIcpword] = useState<string>('')
  const [nameSearchResult, setNameSearchResult] = useState<NameModel>();
  const [namesOfRegistrant, setNamesOfRegistrant] = useState<any>();
  const [namesOfController, setNamesOfController] = useState<any>();

  const isInvalidPrincipal = (word: string) => {
    try {
      Principal.fromText(word);
      return true;
    }
    catch (e) {
      return false
    }
  }

  const creatNameSearchResult = async (searchName, available) => {
    console.log('creatNameSearchResult start..........')
    // let expireAt = available ? '' : 'Expires ' + dateFormat(new Date(await serviceApi.expireAtOf(searchName)), "isoDateTime")
    let expireAt = '';
    if (available) {
      expireAt = '';
    } else {
      await serviceApi.expireAtOf(searchName).then(res => {
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
    if (authWallet.walletAddress) {
      const myFavoriteNames = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
      fav = myFavoriteNames.find(item => item === searchName) || false;
    }
    console.log({ name: searchName, available: available, expireAt, favorite: fav })
    setNameSearchResult({ name: searchName, available: available, expireAt, favorite: fav })
    setLoading(false)
  }
  useEffect(() => {
    if (word && serviceApi) {
      // if word is string
      if (typeof word === 'string') {
        let searchName = '';
        if (!word.endsWith('.')) {
          if (word.split('.').length > 1 && word.split('.')[word.split('.').length - 1] !== 'icp') {
            setLoading(false)
            setIsNotIcp(true)
            setNotIcpword(word.split('.')[word.split('.').length - 1]);
            return;
          } else if (word.split('.').length > 1 && word.split('.')[word.split('.').length - 1] === 'icp') {
            setIsNotIcp(false);
            searchName = word
          } else {
            setIsNotIcp(false);
            searchName = `${word}.${IC_EXTENSION}`
          }
        } else {
          setIsNotIcp(false);
          searchName = `${word}${IC_EXTENSION}`
        }
        serviceApi.available(searchName).then(async available => {
          creatNameSearchResult(searchName, available);
        }).catch(err => {
          if (err instanceof CanisterError) {
            console.log('CanisterError', err);
            if (err.code === 9) {
              creatNameSearchResult(searchName, false);
            } else {
              toast.error(err.message, {
                position: "top-center",
                autoClose: 2000,
                theme: "dark"
              })
            }
          }
        });
      }
      // if word is principal
      else {
        let getNamesOfRegistrantLoaded = false;
        let getNamesOfControllerLoaded = false;
        serviceApi.getNamesOfRegistrant(word).then(res => {
          console.log("search address result of registation", res)
          // for each res ,map it to NameModel
          const names = res.map(n => {
            const expireAt = dateFormat(new Date(Number(n.expired_at)), "isoDateTime")
            let fav = false;
            if (authWallet.walletAddress) {
              const myFavoriteNames = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
              fav = myFavoriteNames.find(item => item === n.name)
            }
            return { name: n.name, avaiable: false, expireAt, favorite: fav }
          })
          setNamesOfRegistrant(names)
          getNamesOfRegistrantLoaded = true;
          if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded) setLoading(false)
        }).catch(err => {
          console.log(err)
          setLoading(false)
        });
        serviceApi.getNamesOfController(word).then(res => {
          console.log("search address result of controller", res)
          // for each res ,map it to NameModel
          const names = res.map(n => {
            let fav = false;
            if (authWallet.walletAddress) {
              const myFavoriteNames = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
              fav = myFavoriteNames.find(item => item === n)
            }
            return { name: n, avaiable: false, expireAt: "", favorite: fav }
          })
          setNamesOfController(names)
          getNamesOfControllerLoaded = true;
          if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded) setLoading(false)
        }
        ).catch(err => {
          console.log(err)
          setLoading(false)
        });
      }
    }
  }, [word, authWallet.walletAddress])// eslint-disable-line react-hooks/exhaustive-deps

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
          {/* <div className={styles['pending-order']}>
            <Banner
              closeIcon={null}
              type="info"
              description={<>you have pending order <Link to="/pay">View</Link></>}
            />
          </div> */}
          <Container className={`pt-5`}>
            {
              loading ?
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
                            <Card name={nameSearchResult?.name || ''}
                              regTime={nameSearchResult?.expireAt || ''}
                              available={nameSearchResult?.available || false}
                              favorite={nameSearchResult?.favorite || false} />
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
                                        regTime={`Expires ${item?.expireAt}`}
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
                                      return <Card key={index} name={`${item.name}`} regTime="" available={item.available} favorite={item.favorite} />
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
