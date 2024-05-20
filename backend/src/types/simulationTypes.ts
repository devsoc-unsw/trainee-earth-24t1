import { IWorldMapDocument } from "./databaseTypes.ts";
import { JSONCompatible, Serializable } from "src/db.ts";
import createId from "src/utils/createId.ts";

export type Coordinates = {
  x: number;
  y: number;
};

export interface WorldMapJSON {
  cells: CellJSON[];
}

export class WorldMap implements Serializable {
  private cells: Map<Coordinates, Cell> = new Map();

  constructor() {}

  addCell(coordinates: Coordinates, cell: Cell): void {
    this.cells.set(coordinates, cell);
  }

  serialize(): JSONCompatible<WorldMapJSON> {
    return {
      cells: Object.values(this.cells).map((cell) => cell.serialize()),
    };
  }

  static deserialize(obj: JSONCompatible<WorldMapJSON>): WorldMap {
    const map = new WorldMap();
    obj.cells.forEach((cell) => {
      map.addCell(cell.coordinates, Cell.deserialize(cell));
    });
    return map;
  }
}
// const map: WorldMap = {
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

type EnviroObjectJSON = {
  _id: string;
  name: string;
};

function isEnviroObjectJSON(obj: any): obj is EnviroObjectJSON {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "_id" in obj &&
    typeof obj._id === "string" &&
    "name" in obj &&
    typeof obj.name === "string"
  );
}

type EnviroObjectId = string; // uuid

// Used for cells that are occupied by an environment object by do not directly
// own the information about the object. Reference the object by its id.
type EnviroObjectRef = EnviroObjectId;

export class EnviroObject implements Serializable {
  private readonly _id: EnviroObjectId;
  private name: string;
  // TODO: store asset
  // asset: any;

  constructor(name: string, _id: EnviroObjectId = createId()) {
    this.name = name;
  }

  serialize(): JSONCompatible<EnviroObjectJSON> {
    return {
      _id: this._id,
      name: this.name,
    };
  }

  static deserialize(obj: JSONCompatible<EnviroObjectJSON>): EnviroObject {
    return new this(obj.name, obj._id);
  }
}

export type CellJSON = {
  coordinates: Coordinates;
  owner: VillagerId | null;
  object: EnviroObjectJSON | EnviroObjectRef | null;
};

export class Cell implements Serializable {
  private coordinates: Coordinates;

  /**
   * VillagerId if the cell is owned by a villager. null if the cell is
   * not owned by any villager.
   */
  private owner: VillagerId | null = null;

  /**
   * 1. EnviroObject if the cell is occupied by an environment object and is the primary
   *   cell responsible for storing the object's info
   * 2. EnviroObjectRef if the cell is occupied by an environment object but is
   *   not the primary cell responsible for storing the object's info.
   * 3. null if the cell is unoccupied (just plain grass)
   */
  private object: EnviroObject | EnviroObjectRef | null = null;

  constructor(x: number, y: number) {
    this.coordinates = { x, y };
  }

  serialize(): JSONCompatible<CellJSON> {
    return {
      coordinates: this.coordinates,
      owner: this.owner,
      object:
        this.object instanceof EnviroObject
          ? this.object.serialize()
          : this.object,
    };
  }

  static deserialize(obj: JSONCompatible<CellJSON>): Cell {
    const cell = new Cell(obj.coordinates.x, obj.coordinates.y);
    cell.owner = obj.owner;
    cell.object = isEnviroObjectJSON(obj.object)
      ? EnviroObject.deserialize(obj.object)
      : obj.object;
    return cell;
  }
}

type VillagerId = string;

const VILLAGER_TYPES_ARRAY = [
  "farmer",
  "merchant",
  "lumberjack",
  "miner",
  "hunter",
  "butcher",
  "shepherd",
  "miller",
  "fisherman",
  "blacksmith",
  "builder",
  "miller",
  "weaver",
  "herbalist",
  "alchemist",
  "potter",
] as const;
type VillagerType = (typeof VILLAGER_TYPES_ARRAY)[number];

export class Villager {
  private readonly _id: VillagerId;
  private type: VillagerType;
  private friends: VillagerId[];
  private enemies: VillagerId[];
  private interactingWith: VillagerId | EnviroObjectId | null = null;
  private energy: number;
  private coins: number;
  private resources: Resources;
  private items: EnviroObjectId[];
  private cosmeticEnvironmentObjects: EnviroObjectId[];
  private characterAttributes: Attributes;

  /**
   * Multipliers against the basic energy gain from producing each kind of
   * resource.
   *
   * Eg: If the basic energy cost of producing 1 unit of wheat is 10, and the
   * this villager's resourceProductionEnergyCostMultipliers[ResourceType.wheat]
   * is 1.5, then it costs 1.5 * 10 = 15 energy for this villager to produce 1
   * unit of wheat.
   *
   * {
   *  ResourceType.wheat: 1.5,
   *  ResourceType.sugar: 1.2,
   *  ResourceType.wood: 0.8,
   * }
   */
  private resourceProductionEnergyCostMultipliers: Map<ResourceType, number> =
    new Map();

  /**
   * Similar to resourceProductionEnergyCostMultipliers, but for resource
   * consumption.
   *
   * {
   *  ResourceType.wood: 0.8, * 30
   *  ResourceType.wheat: 1.5, * 10
   *  ResourceType.sugar: 1.2, * 5
   *  ResourceType.steel: 0,
   * }
   */
  private resourceConsumptionEnergyGainMultipliers: Map<ResourceType, number> =
    new Map();

  constructor() {}
}

const RESOURCE_ARRAY = [
  "wheat",
  "sugar",
  "wood",
  "steel",
  "stone",
  "iron",
  "gold",
  "diamond",
  "coal",
  "glass",
  "fish",
  "plough",
] as const;

export type ResourceType = (typeof RESOURCE_ARRAY)[number];

type Resources = {
  [key in ResourceType]: number;
};

interface IResource {
  name: string;

  /**
   * Basic amount of energy required by a villager to produce 1 unit of this
   * resource. This is multiplied by the villager'
   * resourceProductionEnergyCostMultiplier for this resource to get the actual
   * energy cost.
   */
  productionEnergyCostBasic: number;

  /**
   * Basic amount of energy gained by a villager when consuming 1 unit of this
   * resource. This is multiplied by the villager's
   * resourceConsumptionEnergyGainMultiplier for this resource to get the actual
   * energy gain.
   */
  consumptionEnergyGainBasic: number;
}

class Resource implements IResource {
  name: string;
  productionEnergyCostBasic: number; // 10 energy per unit
  consumptionEnergyGainBasic: number; // 10 energy per unit

  type: "edible" | "tool";

  constructor({
    name,
    productionEnergyCostBasic,
    consumptionEnergyGainBasic,
  }: IResource) {
    this.name = name;
    this.productionEnergyCostBasic = productionEnergyCostBasic;
    this.consumptionEnergyGainBasic = consumptionEnergyGainBasic;
  }
}

const ATTRIBUTES_ARRAY = [
  // Ability to perform physically demanding tasks, such as in harvesting
  // resources.
  "strength",

  // How fast the character can travel across the map.
  "speed",

  // Ability to sustain physical activity over time.
  "stamina",

  // Ability to solve problems and think critically.
  "intelligence",

  // Ability to influence and persuade others, particularly in trades.
  "charisma",

  // Ability to identity profitable opportunities such as resources and
  // trades.
  "perception",

  // Ability to perform tasks that require precision and fine motor skills.
  "dexterity",

  // Ability to create items and objects.
  "crafting",

  // Ability to negotiate and make deals, particularly in trades.
  "negotiation",

  "luck",

  "adventurousness",
] as const;

type AttributeType = (typeof ATTRIBUTES_ARRAY)[number];

type Attributes = {
  [key in AttributeType]: AttributeValue;
};

class AttributeValue {
  readonly _id: string;
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

export interface IProductionPlant {
  readonly _id: string;

  name: string;

  /**
   * @param resourceProductionProportions Map of resources produced by the production
   * plant and their proportions. The proportions should sum to 1.
   *
   * Example: If this production plant produces 80% sugarcane and 20% molasses:
   * {
   *  ResourceType.sugar: 0.8,
   *  ResourceType.molasses: 0.2,
   * }
   */
  resourceProductionProportions: Map<ResourceType, number>;

  /**
   * @param workerCapacity Maximum number of workers that can work at this
   * production plant at the same time.
   */
  workerCapacity: number;

  /**
   * @param energyReserve Amount of energy stored in the production plant.
   * This energy is translated into raw resources. The energy contained in a
   * produced resource should be greater than the energy cost of producing it
   * because this is where energy enters the economy's energy system.
   *
   * Eg: 3000 energy in a production plant can be used to produce at most
   * 40 units of wheat and 60 units of sugar, given that the energy cost of
   * producing 1 unit of wheat is 12 and 1 unit of sugar is 18.
   */
  energyReserve: number;
}

export class ProductionPlant implements IProductionPlant {
  readonly _id: string;
  name: string;
  resourceProductionProportions: Map<ResourceType, number>;
  workerCapacity: number;
  energyReserve: number;

  constructor({
    name,
    resourceProductionProportions,
    workerCapacity,
    energyReserve,
  }: IProductionPlant) {
    this.name = name;
    this.resourceProductionProportions = resourceProductionProportions;
    this.workerCapacity = workerCapacity;
    this.energyReserve = energyReserve;
  }
}
