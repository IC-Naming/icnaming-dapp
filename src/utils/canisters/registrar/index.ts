import { actorFactory } from "../actorFactory";
import {
  _SERVICE,
  BooleanActorResponse,
  GetPageInput,
  RegistrationDto,
  QuotaType as QuotaType_1,
  GetNameExpiresActorResponse,
  GetDetailsActorResponse
} from "./interface";
import { idlFactory } from "./did";
import { REGISTRAR_ID } from "./canisterId";
export type RegistrarActor = _SERVICE;
export type AvailableResult = BooleanActorResponse;
export type NameExpireResult = GetNameExpiresActorResponse;
export type NamesOfAddressResult = GetDetailsActorResponse;
export type RegisterResult = BooleanActorResponse;
export type PagingArgs = GetPageInput;
export type SearchResult = AvailableResult | NamesOfAddressResult;
export type Registration = RegistrationDto;
export type QuotaType = QuotaType_1;
export const createRegistrarQueryActor = () =>
  actorFactory.createActorWithAnonymousIdentity<RegistrarActor>(
    idlFactory,
    REGISTRAR_ID
  );

export const createRegistrarUpdateActor = () =>
  actorFactory.createActor<RegistrarActor>(idlFactory, REGISTRAR_ID);
