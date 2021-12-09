import { actorFactory } from "../actorFactory";
import { _SERVICE } from "./interface";
import { idlFactory } from "./did";
import { RESOLVER_ID } from "./canisterId";
export type ResolverActor = _SERVICE;

export const createResolverQueryActor = () =>
  actorFactory.createActorWithAnonymousIdentity<ResolverActor>(
    idlFactory,
    RESOLVER_ID
  );

export const createResolverUpdateActor = () =>
  actorFactory.createActor<ResolverActor>(
    idlFactory,
    RESOLVER_ID
  );
