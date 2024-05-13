import { ObjectId } from "mongodb";

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

export interface VillagerRequest extends Object {
  friends: VillagerId[];
  enemies: VillagerId[];
  wealth: number;
  resources: Resources;
  items: EnvironmentObjectId[];
  cosmeticEnvironmentObjects: EnvironmentObjectId[];
  characterAttributes: Attributes;
}

export interface Villager extends VillagerRequest {
  _id: VillagerId;
  interactingWith: VillagerId | EnvironmentObjectId | null;
}

enum ResourceEnum {
  wheat,
  sugar,
  wood,
  steel,
  stone,
  iron,
  gold,
  diamond,
  coal,
  glass,
  fish,
  // Add more here!
}

type Resources = {
  [key in keyof typeof ResourceEnum]: number;
};

enum AttributeEnum {
  // Ability to perform physically demanding tasks, such as in harvesting
  // resources.
  strength,

  // How fast the character can travel across the map.
  speed,

  // Ability to sustain physical activity over time.
  stamina,

  // Ability to solve problems and think critically.
  intelligence,

  // Ability to influence and persuade others, particularly in trades.
  charisma,

  // Ability to identity profitable opportunities such as resources and
  // trades.
  perception,

  // Ability to perform tasks that require precision and fine motor skills.
  dexterity,

  // Ability to create items and objects.
  crafting,

  // Ability to negotiate and make deals, particularly in trades.
  negotiation,

  // How lucky the character is.
  luck,
}

type Attributes = {
  [key in AttributeEnum]: Attribute;
};

class Attribute {
  private base: number;
  private boosts: AttributeBoost[] = [];

  constructor(base: number = 0) {
    this.base = base;
  }

  // Adds up base attribute value and all active (not yet expired) boosts
  get totalValue(): number {
    return (
      this.base +
      this.boosts.reduce((acc, boost) => acc + boost.currentValue, 0)
    );
  }

  public addBoost(boost: AttributeBoost): void {
    this.boosts.push(boost);
  }
}

class AttributeBoost {
  private value: number;
  private duration: number;
  private expiration: number;

  /**
   *
   * @param value Value of attribute boost
   * @param duration Duration the boost lasts (in milliseconds)
   */
  constructor(value: number, duration: number) {
    this.value = value;
    this.duration = duration;
    this.expiration = Date.now() + duration;
  }

  public isExpired(): boolean {
    return Date.now() >= this.expiration;
  }

  get originalValue(): number {
    return this.value;
  }

  // Original value if not expired, 0 if expired
  get currentValue(): number {
    return this.isExpired() ? 0 : this.value;
  }
}

export function isVillager(obj: any): obj is Villager {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "_id" in obj &&
    obj._id instanceof ObjectId &&
    "interactingWith" in obj &&
    (obj.interactingWith instanceof ObjectId || obj.interactingWith === null) &&
    "friends" in obj &&
    Array.isArray(obj.friends) &&
    obj.friends.every((friend) => friend instanceof ObjectId) &&
    "enemies" in obj &&
    Array.isArray(obj.enemies) &&
    obj.enemies.every((enemy) => enemy instanceof ObjectId) &&
    "wealth" in obj &&
    typeof obj.wealth === "number" &&
    "items" in obj &&
    Array.isArray(obj.items) &&
    obj.items.every((item) => item instanceof ObjectId)
  );
}
