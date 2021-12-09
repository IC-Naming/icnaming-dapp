import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IC_HOST, isLocalEnv } from "../config";

class ActorFactory {
  private static _instance: ActorFactory = new ActorFactory();
  private static _agent: HttpAgent | undefined;
  public static getInstance() {
    return this._instance;
  }
  _isAuthenticated: boolean = false;

  createActor<T>(
    canisterDid: any,
    canisterId: string | Principal,
    identity?: Identity
  ) {
    const agent = this.getAgent(identity);
    const actor = Actor.createActor<T>(canisterDid, {
      agent,
      canisterId,
    });
    // The root key only has to be fetched for local development environments
    if (isLocalEnv()) {
      agent.fetchRootKey().catch(console.error);
    }
    return actor;
  }

  createActorWithAnonymousIdentity<T>(
    canisterDid: any,
    canisterId: string | Principal
  ) {
    const agent = new HttpAgent({ host: IC_HOST });
    const actor = Actor.createActor<T>(canisterDid, {
      agent,
      canisterId,
    });
    // The root key only has to be fetched for local development environments
    if (isLocalEnv()) {
      agent.fetchRootKey().catch(console.error);
    }
    return actor;
  }

  getAgent(identity?: Identity) {
    if (identity !== undefined)
      return new HttpAgent({
        host: IC_HOST,
        identity: identity,
      });
    else
      return (
        ActorFactory._agent ||
        new HttpAgent({
          host: IC_HOST,
        })
      );
  }

  /*
   * Once a user has authenticated and has an identity pass this identity
   * to create a new actor with it, so they pass their Principal to the backend.
   */
  async authenticateWithIdentity(identity: Identity) {
    ActorFactory._agent = new HttpAgent({
      host: IC_HOST,
      identity: identity,
    });
    this._isAuthenticated = true;
  }

  /*
   * Once a user has authenticated and has an identity pass this identity
   * to create a new actor with it, so they pass their Principal to the backend.
   */
  async authenticateWithAgent(agent: HttpAgent) {
    ActorFactory._agent = agent;
    this._isAuthenticated = true;
  }

  getPrincipal() {
    return ActorFactory._agent?.getPrincipal() || Principal.anonymous();
  }

  /*
   * If a user unauthenticates, recreate the actor without an identity.
   */
  unauthenticateActor() {
    ActorFactory._agent = undefined;
    this._isAuthenticated = false;
  }
}

export const actorFactory = ActorFactory.getInstance();
