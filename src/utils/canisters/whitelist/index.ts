import { Principal } from "@dfinity/principal";
import { actorFactory } from "../../../config/actorFactory";
import { _SERVICE } from "./dao.did";
import { idlFactory } from "./did";

// export const daoTool = (CANISTER_ID) => actorFactory.createActor<_SERVICE>(idlFactory, CANISTER_ID);

export const daoTool = (tokenId: string) => {
  console.log(tokenId)
  debugger
  const canisterId = Principal.fromText(tokenId);
  return actorFactory.createActor<_SERVICE>(idlFactory, canisterId);
};

export const ExtendKeys = {
  DSCVR:'DSCVR',
  OPENCHAT:'OPENCHAT',
  DISTRIKT:'DISTRIKT',
  WEACT:'WEACT',
  OFFICIAL_SITE:'OFFICIAL_SITE',
  MEDIUM:'MEDIUM',
  OFFICIAL_EMAIL:'OFFICIAL_EMAIL',
  DESCRIPTION:'DESCRIPTION',
  BLOG:'BLOG',
  REDDIT:'REDDIT',
  SLACK:'SLACK',
  FACEBOOK:'FACEBOOK',
  TWITTER:'TWITTER',
  GITHUB:'GITHUB',
  TEGEGRAM:'TEGEGRAM',
  WECHAT:'WECHAT',
  LINKEDIN:'LINKEDIN',
  DISCORD:'DISCORD',
  WHITE_PAPER:'WHITE_PAPER',
};