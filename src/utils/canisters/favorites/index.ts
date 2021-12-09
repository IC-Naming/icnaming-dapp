import { actorFactory } from "../actorFactory";
import { _SERVICE } from "./interface";
import { idlFactory } from "./did";
import { FAVORITE_ID } from "./canisterId";
export type FavoritesActor = _SERVICE;

export const createFavoriteActor = () =>
  actorFactory.createActor<FavoritesActor>(idlFactory, FAVORITE_ID);
