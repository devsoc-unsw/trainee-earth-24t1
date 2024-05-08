export type Coordinates = {
  x: number;
  y: number;
};

export type PlayerMap = {
  cells: Map<Coordinates, Cell>;
};

export type EnvironmentObject = {
  name: string;
  imageURL: string;
};

export type Reference = {
  object: EnvironmentObject;
};

export type Unoccupied = {
  object: null;
};

export type Cell =
  | { owner: VillagerId }
  | (EnvironmentObject & Reference & Unoccupied);

export type VillagerId = string;

export interface Villager extends Object {
  id: VillagerId;
  friends: Villager[];
  enemies: Villager[];
  wealth: number;
  items: Object[];
}
