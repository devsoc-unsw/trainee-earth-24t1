export type Map = {
  cells: Cell[][];
};

export type Cell = {
  x: number;
  y: number;
  object: Object;
};

export interface Object {
  name: string;
  imageURL: string;
}

export interface Villager extends Object {
  friends: Villager[];
  enemies: Villager[];
  wealth: number;
  items: Object[];
}
