import {
  transformObjectValues,
  mapToObject,
  Entries,
} from "src/utils/objectTyping.ts";
import { IWorldMapDocument } from "./databaseTypes.ts";
import { JSONCompatible, Serializable } from "src/db.ts";
import createId from "src/utils/createId.ts";
import { Asset, AssetJSON } from "asset-gen/generate-asset.ts";

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

type EnviroObjectJSON = {
  _id: string;
  name: string;
  asset: AssetJSON | null;
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
  protected readonly _id: EnviroObjectId;
  protected name: string;
  asset: Asset | null;

  constructor(
    name: string,
    _id: EnviroObjectId = createId(),
    asset: Asset | null = null
  ) {
    this.name = name;
    this._id = _id;
    this.asset = asset;
  }

  serialize(): JSONCompatible<EnviroObjectJSON> {
    return {
      _id: this._id,
      name: this.name,
      asset: this.asset?.serialize() ?? null,
    };
  }

  static deserialize(obj: JSONCompatible<EnviroObjectJSON>): EnviroObject {
    return new this(
      obj.name,
      obj._id,
      obj.asset ? Asset.deserialize(obj.asset) : null
    );
  }
}

export class CosmeticObject extends EnviroObject implements Serializable {}

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

export type VillagerJSON = {
  _id: string;
  type: VillagerType;
  friends: VillagerId[];
  enemies: VillagerId[];
  interactingWith: VillagerId | EnviroObjectId | null;
  energy: number;
  coins: number;
  resources: ResourcesCount;
  items: EnviroObjectId[];
  cosmeticEnvironmentObjects: EnviroObjectId[];
  resourceProductionEnergyCostMultipliers: { [key in ResourceType]: number };
  resourceConsumptionEnergyGainMultipliers: { [key in ResourceType]: number };
  characterAttributes: { [key in AttributeType]: AttributeValueJSON };
};

export class Villager implements Serializable {
  private readonly _id: VillagerId;
  private type: VillagerType;
  private friends: VillagerId[];
  private enemies: VillagerId[];
  private interactingWith: VillagerId | EnviroObjectId | null = null;
  private energy: number;
  private coins: number;
  private resources: ResourcesCount;
  private items: EnviroObjectId[];
  private cosmeticEnvironmentObjects: EnviroObjectId[];
  private characterAttributes: AttributeValues;

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

  serialize(): JSONCompatible<VillagerJSON> {
    return {
      _id: this._id,
      type: this.type,
      friends: this.friends,
      enemies: this.enemies,
      interactingWith: this.interactingWith,
      energy: this.energy,
      coins: this.coins,
      resources: this.resources,
      items: this.items,
      cosmeticEnvironmentObjects: this.cosmeticEnvironmentObjects,
      resourceProductionEnergyCostMultipliers: mapToObject(
        this.resourceProductionEnergyCostMultipliers
      ),
      resourceConsumptionEnergyGainMultipliers: mapToObject(
        this.resourceConsumptionEnergyGainMultipliers
      ),
      characterAttributes: transformObjectValues(
        this.characterAttributes,
        (attributeValue) => attributeValue.serialize()
      ),
    };
  }
}

const RESOURCES_ARRAY = [
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

export type ResourceType = (typeof RESOURCES_ARRAY)[number];

const RESOURCE_TYPES_ARRAY = [
  "edible",
  "tool",
  "building material",
  "luxury",
] as const;

export type ResourceTypeType = (typeof RESOURCE_TYPES_ARRAY)[number];

type ResourcesCount = {
  [key in ResourceType]: number;
};

export type ResourceJSON = {
  _id: string;
  name: string;
  productionEnergyCostBasic: number;
  consumptionEnergyGainBasic: number;
  type: ResourceTypeType;
};

class Resource implements Serializable {
  private readonly _id: string;
  private name: string;

  /**
   * Basic amount of energy required by a villager to produce 1 unit of this
   * resource. This is multiplied by the villager'
   * resourceProductionEnergyCostMultiplier for this resource to get the actual
   * energy cost.
   */
  private productionEnergyCostBasic: number; // 10 energy per unit

  /**
   * Basic amount of energy gained by a villager when consuming 1 unit of this
   * resource. This is multiplied by the villager's
   * resourceConsumptionEnergyGainMultiplier for this resource to get the actual
   * energy gain.
   */
  private consumptionEnergyGainBasic: number; // 10 energy per unit

  private type: ResourceTypeType;

  constructor(
    name: string,
    productionEnergyCostBasic: number,
    consumptionEnergyGainBasic: number,
    type: ResourceTypeType,
    _id: string = createId()
  ) {
    this.name = name;
    this.productionEnergyCostBasic = productionEnergyCostBasic;
    this.consumptionEnergyGainBasic = consumptionEnergyGainBasic;
    this.type = type;
    this._id = _id;
  }

  serialize(): JSONCompatible<ResourceJSON> {
    return {
      _id: this._id,
      name: this.name,
      productionEnergyCostBasic: this.productionEnergyCostBasic,
      consumptionEnergyGainBasic: this.consumptionEnergyGainBasic,
      type: this.type,
    };
  }

  static deserialize(obj: JSONCompatible<ResourceJSON>): Resource {
    return new Resource(
      obj.name,
      obj.productionEnergyCostBasic,
      obj.consumptionEnergyGainBasic,
      obj.type,
      obj._id
    );
  }
}

export type AttributeValueJSON = {
  _id: string;
  base: number;
  boosts: AttributeBoostJSON[];
};

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

type AttributeValues = {
  [key in AttributeType]: AttributeValue;
};

class AttributeValue implements Serializable {
  private readonly _id: string;
  private base: number;
  private boosts: AttributeBoost[] = [];

  constructor(base: number = 0, _id: string = createId()) {
    this.base = base;
  }

  // Adds up base attribute value and all active (not yet expired) boosts
  get totalValue(): number {
    return (
      this.base +
      this.boosts.reduce((acc, boost) => acc + boost.currentValue, 0)
    );
  }

  addBoost(boost: AttributeBoost): void {
    this.boosts.push(boost);
  }

  serialize(): JSONCompatible<AttributeValueJSON> {
    return {
      _id: this._id,
      base: this.base,
      boosts: this.boosts.map((boost) => boost.serialize()),
    };
  }

  static deserialize(obj: JSONCompatible<AttributeValueJSON>): AttributeValue {
    const instance = new AttributeValue(obj.base, obj._id);
    instance.boosts = obj.boosts.map((boost) =>
      AttributeBoost.deserialize(boost)
    );
    return instance;
  }
}

export type AttributeBoostJSON = {
  value: number;
  duration: number;
  expiration: number;
};

class AttributeBoost implements Serializable {
  private value: number;
  private duration: number;
  private expiration: number;

  /**
   *
   * @param value Value of attribute boost
   * @param duration Duration the boost lasts (in milliseconds)
   */
  constructor(
    value: number,
    duration: number,
    expiration: number = Date.now() + duration
  ) {
    this.value = value;
    this.duration = duration;
    this.expiration = expiration;
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

  serialize(): JSONCompatible<AttributeBoostJSON> {
    return {
      value: this.value,
      duration: this.duration,
      expiration: this.expiration,
    };
  }

  static deserialize(obj: JSONCompatible<AttributeBoostJSON>): AttributeBoost {
    return new AttributeBoost(obj.value, obj.duration, obj.expiration);
  }
}

export interface ProductionPlantJSON extends EnviroObjectJSON {
  resourceProductionProportions: { [key in ResourceType]: number };
  workerCapacity: number;
  energyReserve: number;
}

export class ProductionPlant extends EnviroObject implements Serializable {
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

  constructor(
    name: string,
    resourceProductionProportions: Map<ResourceType, number>,
    workerCapacity: number,
    energyReserve: number = 0,
    _id: string = createId(),
    asset: Asset | null = null
  ) {
    super(name, _id, asset);
    this.resourceProductionProportions = resourceProductionProportions;
    this.workerCapacity = workerCapacity;
    this.energyReserve = energyReserve;
  }

  serialize(): JSONCompatible<ProductionPlantJSON> {
    return {
      ...super.serialize(),
      resourceProductionProportions: mapToObject(
        this.resourceProductionProportions
      ),
      workerCapacity: this.workerCapacity,
      energyReserve: this.energyReserve,
    };
  }

  deserialize(obj: JSONCompatible<ProductionPlantJSON>): ProductionPlant {
    const resourceProductionProportions: Map<ResourceType, number> = new Map();
    (
      Object.entries(obj.resourceProductionProportions) as Entries<
        typeof obj.resourceProductionProportions
      >
    ).forEach(([k, v]) => {
      resourceProductionProportions.set(k, v);
    });
    return new ProductionPlant(
      obj.name,
      resourceProductionProportions,
      obj.workerCapacity,
      obj.energyReserve,
      obj._id,
      obj.asset ? Asset.deserialize(obj.asset) : null
    );
  }
}

export type SpecialItemJSON = {
  _id: string;
  name: string;
  description: string;
  asset: AssetJSON | null;
};

export class SpecialItem implements Serializable {
  private readonly _id: string;
  private name: string;
  private description: string;
  asset: Asset | null;

  constructor(
    name: string,
    description: string,
    _id: string = createId(),
    asset: Asset | null = null
  ) {
    this.name = name;
    this.description = description;
    this._id = _id;
    this.asset = asset;
  }

  serialize(): JSONCompatible<SpecialItemJSON> {
    return {
      _id: this._id,
      name: this.name,
      description: this.description,
      asset: this.asset?.serialize() ?? null,
    };
  }

  static deserialize(obj: JSONCompatible<SpecialItemJSON>): SpecialItem {
    return new SpecialItem(
      obj.name,
      obj.description,
      obj._id,
      obj.asset ? Asset.deserialize(obj.asset) : null
    );
  }
}
