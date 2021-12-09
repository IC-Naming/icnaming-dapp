import { actorFactory } from "../actorFactory";
import { _SERVICE, Result, Result_1 } from "./interface";
import { idlFactory } from "./did";
import { WHITE_LIST_CANISTER_ID } from "./canisterId";
export type WhiteListActor = _SERVICE;
export type AvailableResult = Result;
export type RefStatusResult = Result_1;
export const createWhiteListQueryActor = () =>
  actorFactory.createActorWithAnonymousIdentity<WhiteListActor>(
    idlFactory,
    WHITE_LIST_CANISTER_ID
  );
