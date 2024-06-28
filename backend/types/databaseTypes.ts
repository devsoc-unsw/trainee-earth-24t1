import { WorldMap } from './simulationTypes.js';

export type User = {
  email: string;
};

export interface IWorldMapDocument extends WorldMap, Document {}
