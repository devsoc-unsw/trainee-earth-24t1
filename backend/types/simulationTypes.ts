import {
  transformObjectValues,
  mapToObject,
  serializeMapToJSON,
  deserializeJSONToMap,
  JSONCompatible,
  JSONObject,
  Serializable,
  JSONValue,
} from "@backend/utils/objectTyping.ts";
import { IWorldMapDocument } from "@backend/types/databaseTypes.ts";
import createId from "@backend/utils/createId.ts";
import { AssetId } from "./assetTypes.ts";

export interface SimulationStateJSON extends JSONObject {
  _id: string;
  worldMap: WorldMapJSON;
  villagers: { [key: VillagerId]: VillagerJSON };
  attributes: { [key: AttributeId]: AttributeJSON };
  enviroObjects: { [key: EnviroObjectId]: EnviroObjectJSON };
  resources: { [key: ResourceId]: ResourceJSON };
}

export class SimulationState {
  readonly _id: string;

  public readonly worldMap: WorldMap;

  public readonly villagers: Map<VillagerId, Villager>;

  public readonly attributes: Map<AttributeId, Attribute>;

  /**
   * Includes houses, production objects, cosmetic objects, and any other
   * classes that extend EnviroObject.
   */
  public readonly enviroObjects: Map<EnviroObjectId, EnviroObject>;

  public readonly resources: Map<ResourceId, Resource>;

  transactions: TransactionsType;
  constructor(
    worldMap: WorldMap = new WorldMap(),
    villagers = new Map(),
    attributes = new Map(),
    enviroObjects = new Map(),
    resources = new Map(),
    _id: string = createId()
  ) {
    this._id = _id;
    this.worldMap = worldMap;
    this.villagers = villagers;
    this.attributes = attributes;
    this.enviroObjects = enviroObjects;
    this.resources = resources;
  }

  show() {
    console.log("\n\n=== SimulationState: ===");
    console.dir(this.serialize(), { depth: null });
  }

  serialize(): JSONCompatible<SimulationStateJSON> {
    return {
      _id: this._id,
      worldMap: this.worldMap.serialize(),
      villagers: serializeMapToJSON(this.villagers),
      attributes: serializeMapToJSON(this.attributes),
      enviroObjects: serializeMapToJSON(this.enviroObjects),
      resources: serializeMapToJSON(this.resources),
    };
  }

  static deserialize(
    obj: JSONCompatible<SimulationStateJSON>
  ): SimulationState {
    const state = new SimulationState(
      WorldMap.deserialize(obj.worldMap),
      deserializeJSONToMap(obj.villagers, Villager.deserialize),
      deserializeJSONToMap(obj.attributes, Attribute.deserialize),
      deserializeJSONToMap(obj.enviroObjects, EnviroObject.deserialize),
      deserializeJSONToMap(obj.resources, Resource.deserialize),
      obj._id
    );
    return state;
  }
}

export interface BuyInfo {
  villagerId: VillagerId;
  resourceId: ResourceId;
  buyingPrice: number;
  buyingState: buyPref;
  bought: boolean;
}

export interface SellInfo {
  villagerId: VillagerId;
  resourceId: ResourceId;
  sellingPrice: number;
  sellingQuantity: number;
  sold: boolean;
}

export interface TradeInfo {
  resourceId: ResourceId;
  salePrice: number;
  saleQuantity: number;
  villagerSell: VillagerId;
  villagerBuy: VillagerId;
}

export type TransactionsType = Array<TradeInfo>;

export type Dimensions = {
  dx: number; // x-axis
  dy: number; // y-axis
};

export type PosStr = `${number},${number}`;

export const isPosStr = (str: string): str is PosStr => {
  return /^-?\d+,-?\d+$/.test(str);
};

// expects x and y to be integers
export const serializePosStr = ({ x, y }: { x: number; y: number }): PosStr =>
  `${x},${y}`;

export const parsePosStr = (coordStr: PosStr): Pos => {
  const [x, y] = coordStr.split(",").map((str) => parseInt(str));
  return { x, y };
};

export type Pos = {
  x: number;
  y: number;
};

export type CellsJSON = { [key: PosStr]: CellJSON };

export type Cells = Map<PosStr, Cell>;

/**
 * Check grid centered at pos with dim:
 * - within bounds
 * - completely overlaps with EnviroObjectId (null for empty tiles) if checkObject is true
 * - completely owned by owner (null for no owner) if checkOwner is true
 */
export const checkGridCellsJSON = (
  cells: CellsJSON,
  pos: Pos,
  dim: Dimensions,
  object: EnviroObjectId | null,
  checkObject: boolean,
  owner: VillagerId | null,
  checkOwner: boolean
): boolean => {
  for (
    let x = pos.x - Math.floor(dim.dx / 2);
    x < pos.x + Math.ceil(dim.dx / 2);
    x++
  ) {
    for (
      let y = pos.y - Math.floor(dim.dy / 2);
      y < pos.y + Math.ceil(dim.dy / 2);
      y++
    ) {
      const curPos = { x, y };
      const curPosStr = serializePosStr(curPos);
      if (
        !cells[curPosStr] ||
        (checkObject && cells[curPosStr].object !== object) ||
        (checkOwner && cells[curPosStr].owner !== owner)
      ) {
        return false;
      }
    }
  }
  return true;
};

export const checkGridCells = (
  cells: Cells,
  pos: Pos,
  dim: Dimensions,
  objects: (EnviroObjectId | null)[],
  checkObject: boolean,
  owner: VillagerId | null,
  checkOwner: boolean
): boolean => {
  for (
    let x = pos.x - Math.floor(dim.dx / 2);
    x < pos.x + Math.ceil(dim.dx / 2);
    x++
  ) {
    for (
      let y = pos.y - Math.floor(dim.dy / 2);
      y < pos.y + Math.ceil(dim.dy / 2);
      y++
    ) {
      const curPos = { x, y };
      const curPosStr = serializePosStr(curPos);
      if (
        !cells.get(curPosStr) ||
        (checkObject && !objects.includes(cells.get(curPosStr).object)) ||
        (checkOwner && cells.get(curPosStr).owner !== owner)
      ) {
        console.log(`
        curPos: ${curPosStr},
        object: ${cells.get(curPosStr).object},
        owner: ${cells.get(curPosStr).owner},
        `);

        return false;
      }
    }
  }
  return true;
};

// Fill grid of cells centered at pos, with dimensions x,y, with the object
export const fillGridCellsJSON = (
  cells: CellsJSON,
  pos: Pos,
  dim: Dimensions,
  object: EnviroObjectId | null,
  setObject: boolean,
  owner: VillagerId | null,
  setOwner: boolean
) => {
  for (
    let x = pos.x - Math.floor(dim.dx / 2);
    x < pos.x + Math.ceil(dim.dx / 2);
    x++
  ) {
    for (
      let y = pos.y - Math.floor(dim.dy / 2);
      y < pos.y + Math.ceil(dim.dy / 2);
      y++
    ) {
      const curPos = { x, y };
      const curPosStr = serializePosStr(curPos);
      if (setObject) {
        cells[curPosStr].object = object;
      }
      if (setOwner) {
        cells[curPosStr].owner = owner;
      }
    }
  }
};

export const fillGridCells = (
  cells: Cells,
  pos: Pos,
  dim: Dimensions,
  object: EnviroObjectId | null,
  setObject: boolean,
  owner: VillagerId | null,
  setOwner: boolean
) => {
  for (
    let x = pos.x - Math.floor(dim.dx / 2);
    x < pos.x + Math.ceil(dim.dx / 2);
    x++
  ) {
    for (
      let y = pos.y - Math.floor(dim.dy / 2);
      y < pos.y + Math.ceil(dim.dy / 2);
      y++
    ) {
      const curPos = { x, y };
      const curPosStr = serializePosStr(curPos);
      if (setOwner) {
        cells.get(curPosStr).owner = owner;
      }
      if (setObject) {
        cells.get(curPosStr).object = object;
      }
    }
  }
};

// Oposite of fillCellsGrid
export const clearGridCellsJSON = (
  cells: CellsJSON,
  pos: Pos,
  dim: Dimensions,
  clearObject: boolean,
  clearOwner: boolean
) => {
  fillGridCellsJSON(cells, pos, dim, null, clearObject, null, clearOwner);
};

export const clearGridCells = (
  cells: Cells,
  pos: Pos,
  dim: Dimensions,
  clearObject: boolean,
  clearOwner: boolean
) => {
  fillGridCells(cells, pos, dim, null, clearObject, null, clearOwner);
};

export interface WorldMapJSON extends JSONObject {
  cells: CellsJSON;
}

export class WorldMap implements Serializable<WorldMapJSON> {
  cells: Cells = new Map();

  constructor(cells: Cells = new Map()) {
    this.cells = cells;
  }

  addCell(coordStr: PosStr, cell: Cell): void {
    this.cells.set(coordStr, cell);
  }

  serialize(): JSONCompatible<WorldMapJSON> {
    return {
      cells: serializeMapToJSON(this.cells),
    };
  }

  static deserialize(obj: JSONCompatible<WorldMapJSON>): WorldMap {
    return new WorldMap(deserializeJSONToMap(obj.cells, Cell.deserialize));
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

export interface CellJSON extends JSONObject {
  owner: VillagerId | null;
  object: EnviroObjectId | null;
  pos?: Pos;
}

export class Cell implements Serializable<CellJSON> {
  public readonly coordinates?: Pos;

  /**
   * VillagerId if the cell is owned by a villager. null if the cell is
   * not owned by any villager.
   */
  public owner: VillagerId | null = null;

  /**
   * 1. EnviroObject if the cell is occupied by an environment object. Note
   *    multiple cells can be occupied by the same object.
   * 2. null if the cell is unoccupied (just plain grass)
   *
   * Deprecated case: EnviroObjectRef if the cell is occupied by an environment
   *    object but is not the primary cell responsible for storing the object's
   *    info.
   */
  public object: EnviroObjectId | null = null;

  constructor(coordinates: Pos) {
    this.coordinates = { ...coordinates };
  }

  serialize(): JSONCompatible<CellJSON> {
    return {
      pos: this.coordinates,
      owner: this.owner,
      object: this.object,
    };
  }

  static deserialize(obj: JSONCompatible<CellJSON>): Cell {
    const cell = new Cell({ ...obj.pos });
    cell.owner = obj.owner;
    cell.object = obj.object;
    return cell;
  }
}

export interface EnviroObjectJSON extends JSONObject {
  _id: string;
  name: string;
  asset: AssetId | null;
  pos: Pos | null;
  enviroType: EnviroObjectType;
}

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

export enum EnviroObjectType {
  HOUSE = "HOUSE",
  COSMETIC = "COSMETIC",
  PRODUCTION = "PRODUCTION",
}

export type EnviroObjectId = string; // uuid

/**
 * @deprecated User EnviroObjectId instead.
 *
 * Used for cells that are occupied by an environment object by do not directly
 * own the information about the object. Reference the object by its id.
 *
 */
type EnviroObjectRef = EnviroObjectId;

export class EnviroObject implements Serializable<EnviroObjectJSON> {
  protected readonly _id: EnviroObjectId;
  public readonly name: string;
  public readonly asset: AssetId | null;
  public pos: Pos | null;
  public readonly enviroType: EnviroObjectType;

  constructor(
    name: string,
    _id: EnviroObjectId = createId(),
    asset: AssetId | null = null,
    pos: Pos | null = null,
    enviroType: EnviroObjectType
  ) {
    this.name = name;
    this._id = _id;
    this.asset = asset;
    this.pos = pos;
    this.enviroType = enviroType;
  }

  serialize(): JSONCompatible<EnviroObjectJSON> {
    return {
      _id: this._id,
      name: this.name,
      asset: this.asset,
      pos: this.pos,
      enviroType: this.enviroType,
    };
  }

  static deserialize(obj: JSONCompatible<EnviroObjectJSON>): EnviroObject {
    return new EnviroObject(
      obj.name,
      obj._id,
      obj.asset,
      obj.pos,
      obj.enviroType
    );
  }
}

export interface CosmeticObjectJSON extends EnviroObjectJSON {
  owner: VillagerId | null;
}
export class CosmeticObject
  extends EnviroObject
  implements Serializable<CosmeticObjectJSON>
{
  public readonly owner: VillagerId | null = null;
  constructor(
    name: string,
    owner: VillagerId | null = null,
    _id: EnviroObjectId = createId(),
    asset: AssetId | null = null,
    pos: Pos | null = null
  ) {
    super(name, _id, asset, pos, EnviroObjectType.COSMETIC);
    this.owner = owner;
  }

  serialize(): JSONCompatible<CosmeticObjectJSON> {
    return {
      ...super.serialize(),
      owner: this.owner,
    };
  }

  static deserialize(obj: JSONCompatible<CosmeticObjectJSON>): CosmeticObject {
    return new CosmeticObject(obj.name, obj.owner, obj._id, obj.asset, obj.pos);
  }
}

export const isCosmeticObjectJSON = (
  obj: JSONValue
): obj is CosmeticObjectJSON => {
  return (
    isEnviroObjectJSON(obj) && obj.enviroType === EnviroObjectType.COSMETIC
  );
};

export interface HouseObjectJSON extends EnviroObjectJSON {
  owner: VillagerId | null;
}
export class HouseObject
  extends EnviroObject
  implements Serializable<HouseObjectJSON>
{
  public readonly owner: VillagerId | null = null;

  constructor(
    name: string,
    owner: VillagerId | null = null,
    _id: EnviroObjectId = createId(),
    asset: AssetId | null = null
  ) {
    super(name, _id, asset, null, EnviroObjectType.HOUSE);
    this.owner = owner;
  }

  serialize(): JSONCompatible<HouseObjectJSON> {
    return {
      ...super.serialize(),
      owner: this.owner,
    };
  }

  static deserialize(obj: JSONCompatible<HouseObjectJSON>): HouseObject {
    return new HouseObject(obj.name, obj.owner, obj._id, obj.asset);
  }
}

export const isHouseObjectJSON = (obj: JSONValue): obj is HouseObjectJSON => {
  return isEnviroObjectJSON(obj) && obj.enviroType === EnviroObjectType.HOUSE;
};

export type VillagerId = string;

export const VILLAGER_TYPES_ARRAY = [
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
export type VillagerType = (typeof VILLAGER_TYPES_ARRAY)[number];

export type villagerAssignType = {
  resource: ResourceId;
  sellingPrice: number;
  nItemsMade: number;
  energyCost: number;
} | null;

export interface VillagerJSON extends JSONObject {
  _id: string;
  type: VillagerType;
  friends: VillagerId[];
  enemies: VillagerId[];
  interactingWith: VillagerId | EnviroObjectId | null;
  energy: number;
  coins: number;
  resources: ResourcesCount;
  cosmeticEnvironmentObjects: EnviroObjectId[];
  resourceProductionEnergyCostMultipliers: { [resource: ResourceId]: number };
  resourceConsumptionEnergyGainMultipliers: { [resource: ResourceId]: number };
  characterAttributes: { [attribute: AttributeId]: AttributeValueJSON };
  houseObject: EnviroObjectId | null;
  assignment: {
    resource: ResourceId;
    sellingPrice: number;
    nItemsMade: number;
    energyCost: number;
  } | null;
  readonly asset: AssetId | null;
  pos: Pos | null;
  basePos: Pos;
}

export class Villager implements Serializable<VillagerJSON> {
  public readonly _id: VillagerId;
  public readonly type: VillagerType;
  public friends: VillagerId[];
  public enemies: VillagerId[];
  public _interactingWith: VillagerId | EnviroObjectId | null = null;
  public energy: number;
  public coins: number;
  public resources: ResourcesCount;
  public cosmeticEnvironmentObjects: EnviroObjectId[];
  public characterAttributes: AttributeValues;
  public assignedPlant: boolean;

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
  public resourceProductionEnergyCostMultipliers: Map<ResourceId, number> =
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
  public resourceConsumptionEnergyGainMultipliers: Map<ResourceId, number> =
    new Map();

  public houseObject: EnviroObjectId | null = null;

  public assignment: villagerAssignType;

  public asset: AssetId | null;

  public pos: Pos | null;

  public basePos: Pos;

  constructor(type: VillagerType, _id: VillagerId = createId()) {
    this.type = type;
    this._id = _id;
  }

  serialize(): JSONCompatible<VillagerJSON> {
    return {
      _id: this._id,
      type: this.type,
      friends: this.friends,
      enemies: this.enemies,
      interactingWith: this._interactingWith,
      energy: this.energy,
      coins: this.coins,
      resources: this.resources,
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
      houseObject: this.houseObject,
      assignment: this.assignment,
      asset: this.asset,
      pos: this.pos,
      basePos: this.basePos,
    };
  }

  static deserialize(obj: JSONCompatible<VillagerJSON>): Villager {
    const villager = new Villager(obj.type, obj._id);

    villager.friends = obj.friends;
    villager.enemies = obj.enemies;
    villager._interactingWith = obj.interactingWith;
    villager.energy = obj.energy;
    villager.coins = obj.coins;
    villager.resources = obj.resources;
    villager.cosmeticEnvironmentObjects = obj.cosmeticEnvironmentObjects;

    villager.resourceProductionEnergyCostMultipliers = new Map(
      Object.entries(obj.resourceProductionEnergyCostMultipliers)
    );

    villager.resourceConsumptionEnergyGainMultipliers = new Map(
      Object.entries(obj.resourceConsumptionEnergyGainMultipliers)
    );

    villager.characterAttributes = transformObjectValues(
      obj.characterAttributes,
      (attributeValue) => AttributeValue.deserialize(attributeValue)
    );

    villager.houseObject = obj.houseObject;
    villager.assignment = obj.assignment;
    villager.asset = obj.asset;
    villager.pos = obj.pos;
    villager.basePos = obj.basePos;

    return villager;
  }
}

/**
 * @deprecated
 * We don't want to limit the kinds of resources to this fixed list, we also
 * want to be able dynamically add new kinds of resources to the game as it runs.
 */
const RESOURCES_ARRAY = [
  "wheat",
  "corn",
  "apples",
  "pork",
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

/**
 * @deprecated Use ResourceId instead.
 */
type ResourceType = (typeof RESOURCES_ARRAY)[number];

const RESOURCE_TYPES_ARRAY = ["edible", "tool", "material", "luxury"] as const;

export type ResourceTypeType = (typeof RESOURCE_TYPES_ARRAY)[number];

export enum resourceOrigin {
  bought,
  produced,
  gifted,
}

export enum buyPref {
  wanted,
  notWanted,
  needed,
}

type ResourcesCount = {
  [k: ResourceId]: {
    total: number;
    isSelling: number;
    sellPrice: number;
    buyPrice: number;
    buyState: buyPref;
    origin: resourceOrigin;
  };
};

export type ResourceId = string;

export interface ResourceJSON extends JSONObject {
  _id: string;
  name: string;
  productionEnergyCostBasic: number;
  consumptionEnergyGainBasic: number;
  type: ResourceTypeType;
  attirbuteAffinity: AttributeId[];
  productionObject: EnviroObjectId;
}

export class Resource implements Serializable<ResourceJSON> {
  public readonly _id: ResourceId;

  public readonly name: string;

  /**
   * Basic amount of energy required by a villager to produce 1 unit of this
   * resource. This is multiplied by the villager'
   * resourceProductionEnergyCostMultiplier for this resource to get the actual
   * energy cost.
   */
  public readonly productionEnergyCostBasic: number; // 10 energy per unit

  /**
   * Basic amount of energy gained by a villager when consuming 1 unit of this
   * resource. This is multiplied by the villager's
   * resourceConsumptionEnergyGainMultiplier for this resource to get the actual
   * energy gain.
   */
  public readonly consumptionEnergyGainBasic: number; // 10 energy per unit

  public readonly type: ResourceTypeType;

  public readonly attirbuteAffinity: AttributeId[];

  public readonly productionObject: EnviroObjectId;

  constructor(
    name: string,
    productionEnergyCostBasic: number,
    consumptionEnergyGainBasic: number,
    type: ResourceTypeType,
    attirbuteAffinity: AttributeId[],
    productionObject: EnviroObjectId,
    _id: string = createId()
  ) {
    this.name = name;
    this.productionEnergyCostBasic = productionEnergyCostBasic;
    this.consumptionEnergyGainBasic = consumptionEnergyGainBasic;
    this.type = type;
    this.attirbuteAffinity = attirbuteAffinity;
    this.productionObject = productionObject;
    this._id = _id;
  }

  serialize(): JSONCompatible<ResourceJSON> {
    return {
      _id: this._id,
      name: this.name,
      productionEnergyCostBasic: this.productionEnergyCostBasic,
      consumptionEnergyGainBasic: this.consumptionEnergyGainBasic,
      type: this.type,
      attirbuteAffinity: this.attirbuteAffinity,
      productionObject: this.productionObject,
    };
  }

  static deserialize(obj: JSONCompatible<ResourceJSON>): Resource {
    return new Resource(
      obj.name,
      obj.productionEnergyCostBasic,
      obj.consumptionEnergyGainBasic,
      obj.type,
      obj.attirbuteAffinity,
      obj.productionObject,
      obj._id
    );
  }
}

export type AttributeId = string;

/**
 * @deprecated
 * We don't want to limit the kinds of attributes to this fixed list, we also
 * want to be able dynamically add new kinds of attributes to the game as it runs.
 */
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

/**
 * @deprecated Use AttributeId instead.
 */
type AttributeType = (typeof ATTRIBUTES_ARRAY)[number];

export interface AttributeJSON extends JSONObject {
  _id: string;
  name: string;
}

export class Attribute implements Serializable<AttributeJSON> {
  public readonly _id: AttributeId;
  public readonly name: string;

  constructor(name: string, _id: string = createId()) {
    this.name = name;
    this._id = _id;
  }

  serialize(): JSONCompatible<AttributeJSON> {
    return {
      _id: this._id,
      name: this.name,
    };
  }

  static deserialize(obj: JSONCompatible<AttributeJSON>): Attribute {
    return new Attribute(obj.name, obj._id);
  }
}

/**
 * To represents a villager's attribute stats. A mapping from attributes to the
 * value that the villager has for that attribute.
 *
 * Example:
 * {
 *    "strength": 10,
 *    "speed": 5,
 *    "stamina": 8,
 *    "intelligence": 7,
 * }
 */
type AttributeValues = {
  [attribute: AttributeId]: AttributeValue;
};

export interface AttributeValueJSON extends JSONObject {
  _id: string;
  base: number;
  boosts: AttributeBoostJSON[];
}

type attributeValueId = string;

export class AttributeValue implements Serializable<AttributeValueJSON> {
  public readonly _id: string;

  // Base value for the attribute
  public readonly base: number;

  // List of boosts that modify the attribute value
  public boosts: AttributeBoost[] = [];

  constructor(base: number = 10, _id: string = createId()) {
    this.base = base;
    this._id = _id;
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

export interface AttributeBoostJSON extends JSONObject {
  value: number;
  duration: number;
  expiration: number;
}

class AttributeBoost implements Serializable<AttributeBoostJSON> {
  public readonly value: number;
  public readonly duration: number;
  public readonly expiration: number;

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

export interface ProductionObjectJSON extends EnviroObjectJSON {
  resourceProductionProportions: { [resource: ResourceId]: number };
  workerCapacity: number;
  energyReserve: number;
}

export const isProductionObjectJSON = (
  obj: JSONValue
): obj is ProductionObjectJSON => {
  return (
    isEnviroObjectJSON(obj) && obj.enviroType === EnviroObjectType.PRODUCTION
  );
};

export class ProductionObject
  extends EnviroObject
  implements Serializable<ProductionObjectJSON>
{
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
  public readonly resourceProductionProportions: Map<ResourceId, number>;

  /**
   * @param workerCapacity Maximum number of workers that can work at this
   * production plant at the same time.
   */
  public readonly workerCapacity: number;

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
  public readonly energyReserve: number;

  constructor(
    name: string,
    resourceProductionProportions: Map<ResourceId, number>,
    workerCapacity: number,
    energyReserve: number = 0,
    _id: string = createId(),
    asset: AssetId | null = null
  ) {
    super(name, _id, asset, null, EnviroObjectType.PRODUCTION);
    this.resourceProductionProportions = resourceProductionProportions;
    this.workerCapacity = workerCapacity;
    this.energyReserve = energyReserve;
  }

  serialize(): JSONCompatible<ProductionObjectJSON> {
    return {
      ...super.serialize(),
      resourceProductionProportions: mapToObject(
        this.resourceProductionProportions
      ),
      workerCapacity: this.workerCapacity,
      energyReserve: this.energyReserve,
    };
  }

  deserialize(obj: JSONCompatible<ProductionObjectJSON>): ProductionObject {
    return new ProductionObject(
      obj.name,
      new Map(Object.entries(obj.resourceProductionProportions)),
      obj.workerCapacity,
      obj.energyReserve,
      obj._id,
      obj.asset
    );
  }
}

export interface SpecialItemJSON extends JSONObject {
  _id: string;
  name: string;
  description: string;
  asset: AssetId | null;
}

export class SpecialItem implements Serializable<SpecialItemJSON> {
  public readonly _id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly asset: AssetId | null;

  constructor(
    name: string,
    description: string,
    _id: string = createId(),
    asset: AssetId | null = null
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
      asset: this.asset,
    };
  }

  static deserialize(obj: JSONCompatible<SpecialItemJSON>): SpecialItem {
    return new SpecialItem(obj.name, obj.description, obj._id, obj.asset);
  }
}
