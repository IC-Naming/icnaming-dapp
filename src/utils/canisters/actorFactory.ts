import { Actor, ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { WalletResponse, WalletType } from "utils/connector";
import { IC_HOST, isLocalEnv } from "utils/config";
declare const window: any;
class ActorFactory {
  private static _instance: ActorFactory = new ActorFactory();
  private static _agent: HttpAgent | undefined;
  private static _wallet: WalletResponse | undefined;
  public static getInstance() {
    return this._instance;
  }
  _isAuthenticated: boolean = false;

  async createActor<T>(
    canisterDid: any,
    canisterId: string | Principal
  ): Promise<ActorSubclass<T> | undefined> {
    switch (ActorFactory._wallet?.type) {
      case WalletType.Nns: {
        const agent = this.getAgent(ActorFactory._wallet.identity);
        if (isLocalEnv()) {
          agent.fetchRootKey().catch(console.error);
        }
        return Actor.createActor<T>(canisterDid, {
          agent,
          canisterId,
        });
      }
      case WalletType.Plug: {
        return await window.ic.plug.createActor({
          canisterId: canisterId,
          interfaceFactory: canisterDid,
        });
      }
      case WalletType.Stoic: {
        const agent = this.getAgent(ActorFactory._wallet.identity);
        return Actor.createActor<T>(canisterDid, {
          agent,
          canisterId,
        });
      }
      default:
        console.log("default switch");
        return this.createActorWithAnonymousIdentity(canisterDid, canisterId);
    }
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

  private getAgent(identity?: Identity) {
    if (identity !== undefined) {
      return new HttpAgent({
        host: IC_HOST,
        identity: identity,
      });
    } else {
      return (
        ActorFactory._agent ||
        new HttpAgent({
          host: IC_HOST,
        })
      );
    }
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

  /*
   * Once a user has authenticated and has an identity pass this identity
   * to create a new actor with it, so they pass their Principal to the backend.
   */
  async authenticate(wallet: WalletResponse) {
    ActorFactory._wallet = wallet;
    this._isAuthenticated = true;
  }

  getPrincipal() {
    return (
      ActorFactory._wallet?.principalId ||
      ActorFactory._wallet?.identity?.getPrincipal() ||
      ActorFactory._wallet?.agent?.getPrincipal() ||
      Principal.anonymous()
    );
  }

  /*
   * If a user unauthenticated, recreate the actor without an identity.
   */
  unauthenticateActor() {
    ActorFactory._agent = undefined;
    ActorFactory._wallet = undefined;
    this._isAuthenticated = false;
  }
}

export const actorFactory = ActorFactory.getInstance();
