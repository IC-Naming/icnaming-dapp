import { actorFactory } from "../actorFactory";
import { _SERVICE } from "./interface";
import { idlFactory } from "./did";
import { REGISTRY_ID } from "./canisterId";
export type RegistryActor = _SERVICE;

export const createRegistryQueryActor = () =>
  actorFactory.createActorWithAnonymousIdentity<RegistryActor>(
    idlFactory,
    REGISTRY_ID
  );

export const createRegistryUpdateActor = () =>
  actorFactory.createActor<RegistryActor>(
    idlFactory,
    REGISTRY_ID
  );
