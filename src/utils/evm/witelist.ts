import { CANISTER_IDS } from '../../config/CANISTER_IDS'
import { actorFactory } from "../../config/actorFactory";
import { _SERVICE } from "../canisters/whitelist/white_list.did";
import { idlFactory } from "../canisters/whitelist/did";

// export const daoTool = () => actorFactory.createActor<_SERVICE>(idlFactory, CANISTER_IDS.dao);
export const WhiteTool = () => {
  return actorFactory.createActor<_SERVICE>(idlFactory, CANISTER_IDS.WHITE_LIST);
};
export interface daoInterface {
  isInWhiteList(),
  refStatus()
}
export const WhiteList = () => {
  const isInWhiteList = (address:string,name) => {
    return new Promise<void>(async (resolve, reject) => {
      WhiteTool().isInWhiteList(address,name)
    })
  }
  const refStatus = (ref)=>{
    return new Promise<void>(async (resolve, reject) => {
      WhiteTool().refStatus(ref)
    })
  }
  return {
    isInWhiteList,
    refStatus
  }
}