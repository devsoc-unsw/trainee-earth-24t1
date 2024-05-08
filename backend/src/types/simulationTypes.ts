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

type VillagerId = string;

export interface Villager extends Object {
  id: VillagerId;
  friends: VillagerId[];
  enemies: VillagerId[];
  wealth: number;
  items: EnvironmentObjectId[];
  interactingWith: VillagerId | EnvironmentObjectId | null;
}

export type WebSocketRequest = {
  type: any;
};
