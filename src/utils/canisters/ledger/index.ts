import { actorFactory } from "../actorFactory";
import { _SERVICE } from "./interface";
import { idlFactory } from "./did";
import { IC_LEDGER_ID } from "./canisterId";
export type LedgerActor = _SERVICE;
export const createLedgerActor = () =>
  actorFactory.createActor<LedgerActor>(idlFactory, IC_LEDGER_ID);
