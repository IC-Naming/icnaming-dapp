import { SearchInput } from "../components";
import styles from '../assets/styles/Home.module.scss';
import icpbox from 'utils/icpbox'
import { idlFactory as registrarIDL } from "utils/canisters/registrar/did";
import { REGISTRAR_ID } from "utils/canisters/registrar/canisterId";

import { whietLists } from "utils/canisters/plugWhiteListConfig";
import { Principal } from '@dfinity/principal';
export const Home = () => {

  /* test for icpbox start*/
  const whitelist = whietLists();
  const check = async () => {
    const icpboxConnected: any = await icpbox.isConnected();
    alert('isConnected:' + icpboxConnected.result)
  }

  let principalId;
  const auth = async () => {
    try {
      const data: any = await icpbox.authorize({
        canisters: whitelist,
      });
      principalId = Principal.fromText(data.principal)
      icpbox.setPublickKey(data.publicKey);
      console.log("auth ok: ", data, icpbox.publicKey);
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const testscallCanister = async function () {
    try {
      const registrarUpdateActor: any = await icpbox.createActor({
        canisterId: REGISTRAR_ID,
        interfaceFactory: registrarIDL,
      });
      // const register_result = await registrarUpdateActor.register_with_quota('testicpbox.ticp',quotaParsed);
      // console.log("callUpdate stats", register_result);
      const myquota = await registrarUpdateActor.get_quota(principalId, { LenGte: 4 });
      console.log("callUpdate stats", myquota);

    } catch (error) {
      console.log("error: ", error);
    }
  };

  const pay = async function () {
    const icpboxConnected: any = await icpbox.isConnected();
    if (icpboxConnected.result !== true) {
      alert('no auth')
    } else {
      try {
        const payResult = await icpbox.pay({
          amount: "0.0001",
          to: "63561c8164fb6f462b7a2acfd6304f54991a0eaae5b4182a5c67b6610274ba08",
          memo: "123456",          
        });
        console.log('paydata', payResult)
      } catch (error) {
        console.log(error);
      }
    }
  };

 

  const btnstyle = {
    color: '#fff', backgroundColor: '#07c160', border: 'none', fontSize: 12, width: '40%', height: 30, display: 'block', borderRadius: '5px',
    marginBottom: '1rem', outline: 'none'
  }
  /* test for icpbox end*/
  return (
    <div className={styles.home}>
      <div className="container">
        <div className={styles['home-logo']}></div>
        <SearchInput />

        <div className='text-center mt-3'>
          <button style={btnstyle} onClick={check}>icpbox Connect</button>
          <button style={btnstyle} onClick={auth}>Auth Dapp</button>
          <button style={btnstyle} onClick={testscallCanister}>Call canisterId</button>
          <button style={btnstyle} onClick={pay}>Pay</button>
        </div>

      </div>
    </div>
  );
}