import { Principal } from "@dfinity/principal";
// import axios from "axios";
import {
  createRegistrarQueryActor,
  createRegistrarUpdateActor,
  PagingArgs,
  RegistrarActor,
  Registration,
} from "./canisters/registrar";
import {
  GetNameOrderResponse,
  QuotaType,
  SubmitOrderResponse,
} from "./canisters/registrar/interface";
import {
  createWhiteListQueryActor,
  createWhiteListUpdateActor,
  WhiteListActor,
} from "./canisters/whiteList";
import {
  createRegistryQueryActor,
  //createRegistryUpdateActor,
  RegistryActor,
} from "./canisters/registry";
import {
  createResolverQueryActor,
  createResolverUpdateActor,
  ResolverActor,
} from "./canisters/resolver";
import { createFavoriteActor, FavoritesActor } from "./canisters/favorites";
// import { WHITE_LIST_PROXY_API } from "./config";
import { executeWithLogging } from "./errorLogger";
import { RegistrationDetails } from "./canisters/registrar/interface";
import { RegistryDto } from "./canisters/registry/interface";
import { CanisterError } from "./exception";
import { createNNSActor, NNSActor } from "./canisters/nns";

export interface NameDetails {
  name: string;
  available: boolean;
  registrant: Principal | string;
  controller: Principal | string;
  resolver: Principal | string;
  expireAt: Date | string;
}
export default class ServiceApi {
  private readonly registrarQueryActor: RegistrarActor;
  private readonly registrarUpdateActor: RegistrarActor;
  private readonly whiteListQueryActor: WhiteListActor;
  private readonly createWhiteListUpdateActor: WhiteListActor;
  private readonly registryQueryActor: RegistryActor;
  private readonly resolverQueryActor: ResolverActor;
  private readonly resolverUpdateActor: ResolverActor;
  private readonly favoritesActor: FavoritesActor;
  private readonly nnsActor: NNSActor;

  public constructor() {
    this.registrarQueryActor = createRegistrarQueryActor();
    this.registrarUpdateActor = createRegistrarUpdateActor();
    this.whiteListQueryActor = createWhiteListQueryActor();
    this.createWhiteListUpdateActor = createWhiteListUpdateActor();
    this.registryQueryActor = createRegistryQueryActor();
    this.resolverQueryActor = createResolverQueryActor();
    this.resolverUpdateActor = createResolverUpdateActor();
    this.favoritesActor = createFavoriteActor();
    this.nnsActor = createNNSActor();
  }

  // get icp to cycles rate
  public async getIcpToCyclesRate(): Promise<bigint> {
    return executeWithLogging(async () => {
      const rate = await this.nnsActor.get_icp_to_cycles_conversion_rate();
      return rate;
    });
  }

  /* Registrar */

  // names or addresses search
  public available = (word: string): Promise<boolean> => {
    // if word is string and not empty
    if (word.length > 0) {
      return executeWithLogging(async () => {
        const res = await this.registrarQueryActor.available(`${word}`);
        // console.log('registrarQueryActor.available', res);
        // if res is ErrorInfo
        if ("Ok" in res) {
          return res.Ok;
        } else {
          throw new CanisterError(res.Err);
        }
      });
    } else return Promise.reject(new Error("Invalid search word"));
  };

  // get name expires
  public expireAtOf = (name: string): Promise<number> => {
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_name_expires(name);
      if ("Ok" in res) {
        return Number(res.Ok);
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };


  //reg name by quota
  public registerNameByQuota = (
    name: string,
    quota: number
  ): Promise<boolean> => {
    return executeWithLogging(async () => {
      console.log("reg name", name);
      // convert quota to QuotaType
      const quotaParsed: QuotaType = { LenGte: quota };
      const res = await this.registrarUpdateActor.register_with_quota(
        name,
        quotaParsed
      );
      console.log(res);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // submit order
  public submitRegisterOrder = (
    name: string,
    years: number
  ): Promise<SubmitOrderResponse> => {
    return executeWithLogging(async () => {
      console.log("reg name", name);
      const res = await this.registrarUpdateActor.submit_order({ name, years });
      console.log(res);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get pending order
  public getPendingOrder = (): Promise<[] | [GetNameOrderResponse]> => {
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_pending_order();
      console.log('get_pending_order',res);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get credit
  public creditOfEthAddress = (ethAddress: string): Promise<number> => {
    return executeWithLogging(async () => {
      const res: any = await this.whiteListQueryActor.refStatus(ethAddress);
      console.log("creditOfEthAddress", res);
      if ("Ok" in res) {
        return Number(res.Ok.credit);
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // set record
  public setRecord = (
    name: string,
    key: string,
    value: string
  ): Promise<boolean> => {
    console.table({ name: name, key: key, value: value });
    return executeWithLogging(async () => {
      const res = await this.resolverUpdateActor.set_record_value(name, [
        [key, value],
      ]);
      console.log("setRecord", res);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  public getNamesOfRegistrant = (
    address: Principal
  ): Promise<Array<Registration>> => {
    const pagingArgs: PagingArgs = {
      offset: BigInt(0),
      limit: BigInt(100),
    };
    console.log('getNamesOfRegistrant----------',address)
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_names(address, pagingArgs);
      console.log('get_names----------',res)
      if ("Ok" in res) {
        return res.Ok.items;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  public getNamesOfController = (
    address: Principal
  ): Promise<Array<string>> => {
    const pagingArgs: PagingArgs = {
      offset: BigInt(0),
      limit: BigInt(100),
    };
    return executeWithLogging(async () => {
      const res = await this.registryQueryActor.get_controlled_names(
        address,
        pagingArgs
      );
      if ("Ok" in res) {
        return res.Ok.items;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get name's registrant
  public getRegistrantOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_owner(name);
      console.log("getRegistrantOfName", res);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get name's controller
  public getControllerOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res = await this.registryQueryActor.get_owner(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get name's resolver
  public getResolverOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res = await this.registryQueryActor.get_resolver(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get name's RegistrationDetails
  public getRegistrationDetailsOfName = (
    name: string
  ): Promise<RegistrationDetails> => {
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_details(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get name's records
  public getRecordsOfName = (
    name: string
  ): Promise<Array<[string, string]>> => {
    return executeWithLogging(async () => {
      const res = await this.resolverQueryActor.get_record_value(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get details of name  registry
  public getRegistryDetailsOfName = (name: string): Promise<RegistryDto> => {
    return executeWithLogging(async () => {
      const res: any = await this.registryQueryActor.get_details(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get quota
  public getQuota = (user:Principal,quotaType:number): Promise<number> => {
    return executeWithLogging(async () => {
      const quotaParsed: QuotaType = { LenGte: quotaType };
      const res: any = await this.registrarQueryActor.get_quota(user,quotaParsed);
      console.log('get_quota',res)
      if ("Ok" in res) {
        return Number(res.Ok);
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // get name details
  public getNameDetails = (name: string): Promise<any> => {
    return executeWithLogging(async () => {
      const values = await Promise.all([
        this.available(name),
        this.getRegistrationDetailsOfName(name),
        this.getRegistryDetailsOfName(name),
      ]);
      console.log(values)
      if (values[1].owner && values[2].owner) {
        return {
          name,
          available: values[0],
          registrant: values[1].owner.toText(),
          controller: values[2].owner.toText(),
          resolver: values[2].resolver.toText(),
          expireAt: new Date(Number(values[1].expired_at)),
        };
      } else {
        return {
          name: "ICP",
          available: values[0],
          registrant: "Not owned",
          controller: "Not owned",
          resolver: "No Resolver set",
          expireAt: "No Expire set",
        };
      }
    });
  };

  // get favorite names
  public getFavoriteNames = (): Promise<Array<string>> => {
    return executeWithLogging(async () => {
      const res = await this.favoritesActor.get_favorites();
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // add favorite name
  public addFavoriteName = (name: string): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res: any = await this.favoritesActor.add_favorite(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  // remove favorite name
  public removeFavoriteName = (name: string): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res: any = await this.favoritesActor.remove_favorite(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };
}
