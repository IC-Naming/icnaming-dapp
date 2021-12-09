import { useEffect, useState } from 'react'
import { SearchInput, Card, CopyToClipboard } from "../components";
import { Principal } from '@dfinity/principal';
import styles from '../assets/styles/Search.module.scss'
import { Container, Tab, Tabs } from 'react-bootstrap';
import ServiceApi from '../utils/ServiceApi';
import { useAuthWallet } from '../context/AuthWallet';
import dateFormat from "dateformat";

export const MyAccount = () => {
  const { ...authWallet } = useAuthWallet();
  const serviceApi = new ServiceApi();
  const [loading, setLoading] = useState<boolean>(true)
  const [namesOfRegistrant, setNamesOfRegistrant] = useState<any>();
  const [namesOfController, setNamesOfController] = useState<any>();
 
  /*  const [myFavourites, setMyFavourites] = useState<any>();
    const getMyFavoriteNames = async () => {
    let myFavoriteNames = await serviceApi.getFavoriteNames()
    return (myFavoriteNames);
  } */
  useEffect(() => {
    if (authWallet.walletAddress) {
      const wordParam: Principal = Principal.fromText(authWallet.walletAddress);
      let getNamesOfRegistrantLoaded = false;
      let getNamesOfControllerLoaded = false;

      serviceApi.getNamesOfRegistrant(wordParam).then(res => {
        console.log("my address result of registation", res)
        // for each res ,map it to NameModel
        const names = res.map(n => {
          const expireAt = 'Expires ' + dateFormat(new Date(Number(n.expired_at)), "isoDateTime")
          let fav = false;

          const myFavoriteNames = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
          if (myFavoriteNames) {
            fav = myFavoriteNames.find(item => item === n.name);
          }

          return { name: n.name, avaiable: false, expireAt, favorite: fav }
        })
        setNamesOfRegistrant(names)
        getNamesOfRegistrantLoaded = true;
        if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded)
          setLoading(false)
      }).catch(err => {
        console.log(err)
        setLoading(false)
      });
      serviceApi.getNamesOfController(wordParam).then(res => {
        console.log("my address result of controller", res)
        // for each res ,map it to NameModel
        const names = res.map(n => {
          return { name: n, avaiable: false, expireAt: "" }
        })
        setNamesOfController(names)
        getNamesOfControllerLoaded = true;
        if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded)
          setLoading(false)
      }
      ).catch(err => {
        console.log(err)
        setLoading(false)
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authWallet.walletAddress])

  return (
    <div className={styles.serach}>
      <div className="container pt-5">
        <div className={styles['serach-content']}>
          <SearchInput />
          <Container className={`pt-5`}>
            {
              loading ?
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status"></div>
                </div> :
                <>
                  <div className={styles['search-address']}>
                    <span className={styles.icon}><i className="bi bi-person"></i></span>
                    <span className={styles.address}>{authWallet.walletAddress}</span>
                    <CopyToClipboard text={authWallet.walletAddress} />
                  </div>
                  <div className={styles['search-result']}>

                    <Tabs defaultActiveKey="registrant" className="mb-3">
                      <Tab eventKey="registrant" title="Registrant">
                        {
                          namesOfRegistrant.length > 0 ?
                            <div className={styles.list}>
                              {
                                namesOfRegistrant.map((item, index) => {
                                  return <Card key={index} name={item.name} regTime={item.expireAt} available={false} isMyAccount={true} favorite={item.favorite} />
                                })
                              }
                            </div> :
                            <div className="nodata"><span>No data</span></div>
                        }
                      </Tab>
                      <Tab eventKey="controller" title="Controller">
                        {
                          namesOfController.length > 0 ?
                            <div className={styles.list}>
                              {
                                namesOfController.map((item, index) => {
                                  return <Card key={index} name={item.name} regTime="" available={false} isMyAccount={true} favorite={item.favorite} />
                                })
                              }
                            </div> :
                            <div className="nodata"><span>No data</span></div>
                        }
                      </Tab>
                    </Tabs>
                  </div>

                </>
            }

          </Container>
        </div>
      </div>
    </div >
  )
}
