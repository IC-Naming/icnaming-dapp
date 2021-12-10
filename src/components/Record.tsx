import styles from "../assets/styles/Name.module.scss";
import { useEffect, useState } from "react";
import { useAuthWallet } from "../context/AuthWallet";
import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";
import { Spinner } from "react-bootstrap";
import { CopyToClipboard } from ".";
import { isBTCAddress, isETHAddress, isLTCAddress, isEmail } from "../utils/helper";
import { Principal } from "@dfinity/principal";

interface Props {
  name: string;
  recordKey: string;
  title: string;
  value: string;
  registant: any;
  controller: any;
}

export const Record: React.FC<Props> = ({ title, name, recordKey, value, registant, controller }) => {
  const { ...auth } = useAuthWallet();
  const [recordSaveLoading, setRecordSaveLoading] = useState(false);
  const serviceApi = new ServiceApi();
  const [recordVal, setRecordVal] = useState<string>('');
  const [ischangeRecordVal, setIschangeRecordVal] = useState(false);
  const [isController, setIsController] = useState(false);

  const handleRecordChange = (e: any) => {
    setIschangeRecordVal(true)
    setRecordVal(e.target.value);
  };

  // isCanisterAddress
  const isCanisterAddress = (address: string) => {
    try {
      Principal.fromText(address);
      return true;
    }
    catch (e) {
      return false
    }
  }

  const notToast = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 2000,
      theme: "dark",
    });
  }

  useEffect(() => {
    if (auth.principal?.toText() === registant || auth.principal?.toText() === controller) setIsController(true); 
  }, [auth, controller, registant]);

  useEffect(() => {
    value ? setRecordVal(value) : setRecordVal('Not set');
  }, [value])

  const recordSet = async () => {
    setRecordSaveLoading(true);
    serviceApi.setRecord(name, recordKey, recordVal).then(res => {
      if (res) {
        toast.success('Set record Done', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      } else {
        toast.error('Set record failed', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      }
      setRecordSaveLoading(false);
      setIschangeRecordVal(false)
    })
      .catch(err => {
        toast('Set record failed', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      })
  }

  const handleSetRecord = () => {
    if (recordKey === 'token.btc') {
      isBTCAddress(recordVal) ? recordSet() : notToast('Invalid BTC address');
    } else if (recordKey === 'token.eth') {
      isETHAddress(recordVal) ? recordSet() : notToast('Invalid ETH address');
    } else if (recordKey === 'token.ltc') {
      isLTCAddress(recordVal) ? recordSet() : notToast('Invalid LTC address');
    } else if (recordKey === 'email') {
      isEmail(recordVal) ? recordSet() : notToast('Invalid email address');
    } else if (recordKey === 'canister.icp') {
      isCanisterAddress(recordVal) ? recordSet() : notToast('Invalid Canister address');
    } else {
      recordSet();
    }
  }

  return (
    <div className={styles.flexrow}>
      <div className={styles.flexcol}>
        {title === 'Canister' ? '' : title}
      </div>
      {
        !isController ?
          <div className={styles.flexcol}>
            <span className={styles['d-text']}>{recordVal}</span>
            {value && <CopyToClipboard text={recordVal} />}
          </div> :
          <div className={styles.flexcol}>
            <input type="text" 
              className={styles.contentEditable}
              value={recordVal}
              onChange={e => {
                handleRecordChange(e);
              }} />
          </div>
      }
      <div className={styles.flexcol}>
        {isController && ischangeRecordVal &&
          <button className={styles['btn-save']}
            disabled={recordSaveLoading}
            onClick={() => { handleSetRecord() }}>
            {recordSaveLoading && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}Save
          </button>
        }
      </div>
    </div >
  )
}