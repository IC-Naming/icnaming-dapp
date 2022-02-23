import { _Service } from "./interface";
import { idlFactory } from "./did";
import { IC_NNS_ID } from "./canisterId";
import { actorFactory } from "../actorFactory";
export type NNSActor = _Service;

export const createNNSActor = () => {
  // with anonymous identity will better performance for readonly operations
  return actorFactory.createActorWithAnonymousIdentity<NNSActor>(
    idlFactory,
    IC_NNS_ID
  );
};
