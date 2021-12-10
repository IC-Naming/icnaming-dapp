import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
export const IC_HOST = "https://ic0.app";

const isLocalEnv = false;


// export const host = getHost();
export const host = IC_HOST;

class ActorFactory {
  private static _instance: ActorFactory = new ActorFactory();
  private static _agent: any;
  public static getInstance() {
    return this._instance;
  }
  _isAuthenticated: boolean = false;

  createActor<T>(canisterDid: any, canisterId: string | Principal, identity?: Identity) {
    const agent = this.getAgent(identity);
    const actor = Actor.createActor<T>(canisterDid, {
      agent,
      canisterId,
    });
    // The root key only has to be fetched for local development environments
    if (isLocalEnv) {
      agent.fetchRootKey().catch(console.error);
    }
    return actor;
  }

  getAgent(identity?: Identity) {
    if (identity !== undefined)
      return new HttpAgent({
        host,
        identity: identity,
      });
    else return ActorFactory._agent || new HttpAgent({
      host
    });
  }

  /*
   * Once a user has authenticated and has an identity pass this identity
   * to create a new actor with it, so they pass their Principal to the backend.
   */
  async authenticateWithIdentity(identity: Identity) {
    ActorFactory._agent = new HttpAgent({
      host,
      identity: identity
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

  /*
   * If a user unauthenticates, recreate the actor without an identity.
   */
  unauthenticateActor() {
    ActorFactory._agent = undefined;
    this._isAuthenticated = false;
  }
}

export const actorFactory = ActorFactory.getInstance();
