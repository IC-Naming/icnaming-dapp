import { Principal } from "@dfinity/principal";
import axios from "axios";
import {
  createRegistrarQueryActor,
  createRegistrarUpdateActor,
  PagingArgs,
  RegistrarActor,
  Registration,
} from "./canisters/registrar";
import {
  createWhiteListQueryActor,
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
import { WHITE_LIST_PROXY_API } from "./config";
import { executeWithLogging } from "./errorLogger";
import { RegistrationDetails } from "./canisters/registrar/interface";
import { RegistryDto } from "./canisters/registry/interface";

export interface NameDetails {
  name: string;
  available: boolean;
  registrant: Principal|string;
  controller: Principal|string;
  resolver: Principal|string;
  expireAt: Date|string;
}
export default class ServiceApi {
  private readonly registrarQueryActor: RegistrarActor;
  private readonly registrarUpdateActor: RegistrarActor;
  private readonly whiteListQueryActor: WhiteListActor;
  private readonly registryQueryActor: RegistryActor;
  private readonly resolverQueryActor: ResolverActor;
  private readonly resolverUpdateActor: ResolverActor;
  private readonly favoritesActor: FavoritesActor;

  public constructor() {
    this.registrarQueryActor = createRegistrarQueryActor();
    this.registrarUpdateActor = createRegistrarUpdateActor();
    this.whiteListQueryActor = createWhiteListQueryActor();
    this.registryQueryActor = createRegistryQueryActor();
    this.resolverQueryActor = createResolverQueryActor();
    this.resolverUpdateActor = createResolverUpdateActor();
    this.favoritesActor = createFavoriteActor();
  }

  /* Registrar */

  // names or addresses search
  public available = (word: string): Promise<boolean> => {
    // if word is string and not empty
    if (word.length > 0) {
      return executeWithLogging(async () => {
        const res: any = await this.registrarQueryActor.available(`${word}`);
        // if res is ErrorInfo
        if (res.Ok) {
          return res.Ok;
        } else {
          console.log(res.Err);
          return false;
        }
      });
    } else return Promise.reject(new Error("Invalid search word"));
  };

  // get name expires
  public expireAtOf = (name: string): Promise<number> => {
    return executeWithLogging(async () => {
      const res: any = await this.registrarQueryActor.get_name_expires(name);
      if (res.Ok) {
        return Number(res.Ok);
      } else {
        console.log(res.Err);
        return 0;
      }
    });
  };

  // get credit
  public creditOfEthAddress = (ethAddress: string): Promise<number> => {
    return executeWithLogging(async () => {
      const res: any = await this.whiteListQueryActor.refStatus(ethAddress);
      if (res.Ok) {
        return Number(res.Ok.credit);
      } else {
        console.log(res.Err);
        return 0;
      }
    });
  };

  // reg name
  public registerName = (
    name: string,
    ethAddress: string,
    icpAddress: string,
    signMessage: string
  ): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res = await axios.post(WHITE_LIST_PROXY_API, {
        name,
        ethAddress,
        icpAddress,
        signMessage,
      });

      if (res.data.code === 0) {
        return true;
      } else {
        console.log(res.data.message);
        return false;
      }
    });
  };

  // set record
  public setRecord = (
    name: string,
    key: string,
    value: string
  ): Promise<boolean> => {
    console.table({name:name ,key:key, value:value});
    return executeWithLogging(async () => {
      const res: any = await this.resolverUpdateActor.set_record_value(name, [
        [key, value],
      ]);
      console.log('setRecord',res);
      if (res.Ok) {
        
        return true;
      }
      console.log(res.Err);
      return false;
    });
  };

  public getNamesOfRegistrant = (
    address: Principal
  ): Promise<Array<Registration>> => {
    const pagingArgs: PagingArgs = {
      offset: BigInt(0),
      limit: BigInt(100),
    };
    return executeWithLogging(async () => {
      const res: any = await this.registrarQueryActor.get_names(
        address,
        pagingArgs
      );
      if (res.Ok) {
        return res.Ok.items;
      } else {
        console.log(res.Err);
        return [];
      }
    });
  };

  public getNamesOfController = (
    address: Principal
  ): Promise<Array<Registration>> => {
    const pagingArgs: PagingArgs = {
      offset: BigInt(0),
      limit: BigInt(100),
    };
    return executeWithLogging(async () => {
      const res: any = await this.registryQueryActor.get_controlled_names(
        address,
        pagingArgs
      );
      if (res.Ok) {
        return res.Ok.items;
      } else {
        console.log(res.Err);
        return [];
      }
    });
  };

  // get name's registrant
  public getRegistrantOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res: any = await this.registrarQueryActor.get_owner(name);
      if (res.Ok) {
        return res.Ok;
      } else {
        console.log(res.Err);
        return Principal.anonymous();
      }
    });
  };

  // get name's controller
  public getControllerOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res: any = await this.registryQueryActor.get_owner(name);
      if (res.Ok) {
        return res.Ok;
      } else {
        console.log(res.Err);
        return Principal.anonymous();
      }
    });
  };

  // get name's resolver
  public getResolverOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res: any = await this.registryQueryActor.get_resolver(name);
      if (res.Ok) {
        return res.Ok;
      } else {
        console.log(res.Err);
        return Principal.anonymous();
      }
    });
  };

  // get name's RegistrationDetails
  public getRegistrationDetailsOfName = (
    name: string
  ): Promise<RegistrationDetails> => {
    return executeWithLogging(async () => {
      const res: any = await this.registrarQueryActor.get_details(name);
      if (res.Ok) {
        return res.Ok;
      } else {
        console.log(res.Err);
        return {};
      }
    });
  };

  // get name's records
  public getRecordsOfName = (
    name: string
  ): Promise<Array<[string, string]>> => {
    return executeWithLogging(async () => {
      const res: any = await this.resolverQueryActor.get_record_value(name);
      if (res.Ok) {
        return res.Ok;
      } else {
        console.log(res.Err);
        return [];
      }
    });
  };

  // get details of name  registry
  public getRegistryDetailsOfName = (name: string): Promise<RegistryDto> => {
    return executeWithLogging(async () => {
      const res: any = await this.registryQueryActor.get_details(name);
      if (res.Ok) {
        return res.Ok;
      } else {
        console.log(res.Err);
        return {};
      }
    });
  };

  // get name details
  public getNameDetails = (name: string): Promise<any> => {
    return executeWithLogging(async () => {
      const values = await Promise.all([
        this.available(name),
        this.getRegistrationDetailsOfName(name),
        this.getRegistryDetailsOfName(name)
      ]);
      if (values[1].owner && values[2].owner) {
        return {
          name,
          available: values[0],
          registrant: values[1].owner.toText(),
          controller: values[2].owner.toText(),
          resolver: values[2].resolver.toText(),
          expireAt: new Date(Number(values[1].expired_at)),
        };
      }else{
        return {
          name: 'ICP',
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
  public getFavoriteNames = (): Promise<Array<[string, string]>> => {
    return executeWithLogging(async () => {
      const res: any = await this.favoritesActor.get_favorites();
      if (res.Ok) {
        return res.Ok;
      } else {
        console.log(res.Err);
        return [];
      }
    });
  };

  // add favorite name
  public addFavoriteName = (name: string): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res: any = await this.favoritesActor.add_favorite(name);
      if (res.Ok ) {
        return true;
      } else {
        console.log(res.Err);
        return false;
      }
    });
  };

  // remove favorite name
  public removeFavoriteName = (name: string): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res: any = await this.favoritesActor.remove_favorite(name);
      if (res.Ok) {
        return true;
      } else {
        console.log(res.Err);
        return false;
      }
    });
  };
}
