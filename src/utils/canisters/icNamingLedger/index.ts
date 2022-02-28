import { actorFactory } from "../actorFactory";
import { _SERVICE } from "./interface";
import { idlFactory } from "./did";
import { IC_NAMING_LEDGER_ID } from "./canisterId";
export type LedgerActor = _SERVICE;
export const createICNamingLedger = () =>
  actorFactory.createActor<LedgerActor>(idlFactory, IC_NAMING_LEDGER_ID);
