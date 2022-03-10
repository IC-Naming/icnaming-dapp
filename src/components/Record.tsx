import styles from "../assets/styles/Name.module.scss";
import { useEffect, useState } from "react";
import { useAuthWallet } from "../context/AuthWallet";
import ServiceApi from "../utils/ServiceApi";
import { Spinner } from "react-bootstrap";
import { CopyToClipboard } from ".";
import { isValidAddress, isEmail } from "../utils/helper";
import { deleteCache } from '../utils/localCache';
import toast from "@douyinfe/semi-ui/lib/es/toast";

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

  const notToast = (msg) => {
    toast.error(msg);
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
        toast.success('Set record success');
        console.log('clear Records cache')
        deleteCache(name + 'Records')
      } else {
        toast.error('Set record failed');
      }
      setRecordSaveLoading(false);
      setIschangeRecordVal(false)
    })
      .catch(err => {
        setRecordSaveLoading(false)
        toast.error('Set record failed');
      })
  }

  const handleSetRecord = () => {
    if (recordKey === 'token.btc') {
      isValidAddress(recordVal, "btc") ? recordSet() : notToast('Invalid BTC address');
    } else if (recordKey === 'token.eth') {
      isValidAddress(recordVal, "eth") ? recordSet() : notToast('Invalid ETH address');
    } else if (recordKey === 'token.ltc') {
      isValidAddress(recordVal, "ltc") ? recordSet() : notToast('Invalid LTC address');
    } else if (recordKey === 'token.icp') {
      isValidAddress(recordVal, "icp") ? recordSet() : notToast('Invalid ICP address');
    } else if (recordKey === 'email') {
      isEmail(recordVal) ? recordSet() : notToast('Invalid email address');
    } else if (recordKey === 'canister.icp') {
      isValidAddress(recordVal, "icp") ? recordSet() : notToast('Invalid canister id');
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
              onFocus={(e) => {
                if (e.target.value === 'Not set') setRecordVal('');
              }}
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