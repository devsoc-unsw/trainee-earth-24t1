import { ObjectId } from 'mongodb';

export type Coordinates = {
  x: number;
  y: number;
};

export type PlayerMap = {
  cells: Map<Coordinates, Cell>;
};

// const map: PlayerMap = {
//   cells: {
//     {x: 0, y: 0}: {
//       owner: 'lachlan',
//       object: 'tree',
//     },
//     {x: 1, y: 2}: {
//       owner: 'gordon',
//       object: 'town hall part 1'
//     }
//   }
// }

type EnvironmentObjectId = string; // uuid

export type EnvironmentObject = {
  id: EnvironmentObjectId;
  name: string;
  imageURL: string;
};

export type Reference = {
  object: EnvironmentObjectId;
};

export type Unoccupied = {
  object: null;
};

export type Cell = (OwnedCell | UnownedCell) &
  (EnvironmentObject | Reference | Unoccupied);

type OwnedCell = {
  owner: VillagerId;
};

type UnownedCell = {
  owner: null;
};

type VillagerId = ObjectId;

export interface Villager extends VillagerRequest {
  _id: VillagerId;
  interactingWith: VillagerId | EnvironmentObjectId | null;
}

export interface VillagerRequest extends Object {
  friends: VillagerId[];
  enemies: VillagerId[];
  wealth: number;
  items: EnvironmentObjectId[];
}

export function isVillager(obj: any): obj is Villager {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj &&
    obj._id instanceof ObjectId &&
    'interactingWith' in obj &&
    (obj.interactingWith instanceof ObjectId || obj.interactingWith === null) &&
    'friends' in obj &&
    Array.isArray(obj.friends) &&
    obj.friends.every((friend) => friend instanceof ObjectId) &&
    'enemies' in obj &&
    Array.isArray(obj.enemies) &&
    obj.enemies.every((enemy) => enemy instanceof ObjectId) &&
    'wealth' in obj &&
    typeof obj.wealth === 'number' &&
    'items' in obj &&
    Array.isArray(obj.items) &&
    obj.items.every((item) => item instanceof ObjectId)
  );
}
