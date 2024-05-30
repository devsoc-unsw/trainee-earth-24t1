import { WorldMap } from "./simulationTypes.ts";

export type User = {
  email: string;
};

export interface IWorldMapDocument extends WorldMap, Document {}
