import styles from "../assets/styles/Name.module.scss";
import { useEffect, useState } from "react";
import { useAuthWallet } from "../context/AuthWallet";
import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";
import { Spinner } from "react-bootstrap";
import { CopyToClipboard } from ".";
import { isBTCAddress, isETHAddress, isLTCAddress, isEmail } from "../utils/helper";

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
  const [record, SetRecord] = useState<string>('');
  const [isController, setIsController] = useState(false);
  const handleRecordChange = (e: any) => {
    SetRecord(e.target.value);
  };

  const notToast = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 2000,
      theme: "dark",
    });
  }

  useEffect(() => {
    if (auth.principal?.toText() === registant || auth.principal?.toText() === controller) setIsController(true);
    value ? SetRecord(value) : SetRecord('Not set');
  }, [auth, value,controller, registant]);

  const RecordSet = async () => {
    setRecordSaveLoading(true);
    serviceApi.setRecord(name, recordKey, record).then(res => {
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
      isBTCAddress(record) ? RecordSet() : notToast('Invalid BTC address');
    } else if (recordKey === 'token.eth') {
      isETHAddress(record) ? RecordSet() : notToast('Invalid ETH address');
    } else if (recordKey === 'token.ltc') {
      isLTCAddress(record) ? RecordSet() : notToast('Invalid ETH address');
    } else if (recordKey === 'email') {
      isEmail(record) ? RecordSet() : notToast('Invalid email address');
    } else {
      RecordSet();
    }
  }

  return (
    <div className={styles.flexrow}>
      <div className={styles.flexcol}>
        {title === 'Canister'?'':title}
      </div>
      {
        !isController ?
          <div className={styles.flexcol}>
            <span className={styles['d-text']}>{record}</span>
            {value && <CopyToClipboard text={record} />}
          </div> :
          <div className={styles.flexcol}>
            <input type="text" className={styles.contentEditable}
              value={record}
              onChange={e => {
                handleRecordChange(e);
              }} />
          </div>
      }
      <div className={styles.flexcol}>
        {isController &&
          <button className={styles['btn-save']}
            disabled={recordSaveLoading}
            onClick={() => {
              handleSetRecord()
            }}>
            {
              recordSaveLoading && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />
            }Save
          </button>
        }
      </div>
    </div >
  )
}