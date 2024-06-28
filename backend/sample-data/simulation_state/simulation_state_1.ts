import { AssetsJSON } from '../../types/assetTypes.js';
import {
  AttributeJSON,
  CellJSON,
  CosmeticObjectJSON,
  EnviroObjectId,
  EnviroObjectJSON,
  EnviroObjectType,
  HouseObjectJSON,
  PosStr,
  ProductionObjectJSON,
  ResourceJSON,
  SimulationStateJSON,
  VillagerJSON,
  WorldMapJSON,
  checkGridCellsJSON,
  fillGridCellsJSON,
  isCosmeticObjectJSON,
  isHouseObjectJSON,
  isProductionObjectJSON,
  serializePosStr,
} from '../../types/simulationTypes.js';
import { Entries } from '../../utils/objectTyping.js';

const VILLAGER_PLOT_DIM = {
  dx: 18,
  dy: 18,
};

const cells: Record<PosStr, CellJSON> = {};

// 100 x 100 centered at (0,0)
for (let x = -50; x < 50; x++) {
  for (let y = -50; y < 50; y++) {
    const pos = { x, y };
    cells[serializePosStr(pos)] = {
      owner: null,
      object: null,
      pos: pos,
    };
  }
}

export const worldMap: WorldMapJSON = {
  cells: cells,
};

const villager1: VillagerJSON = {
  name: 'Sarah',
  _id: 'villager_1',
  type: 'farmer',
  friends: ['villager_2'],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ['cosmetic_1'], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: 'house_1',
  assignment: null,
  asset: 'villager_1_asset',
  pos: { x: 1, y: 5 }, // in front of house_1
  basePos: { x: 0, y: 0 },
  villagerPath: [],
};

const villager2: VillagerJSON = {
  name: 'Dylan',
  _id: 'villager_2',
  type: 'miner',
  friends: ['villager_1'],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ['cosmetic_2'], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: 'house_2',
  assignment: null,
  asset: 'villager_2_asset',
  pos: { x: 18, y: 8 },
  basePos: { x: 36, y: 8 },
  villagerPath: [],
};

const villager3: VillagerJSON = {
  name: 'Caitlyn',
  _id: 'villager_3',
  type: 'miner',
  friends: ['villager_1'],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ['cosmetic_3'], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: 'house_3',
  assignment: null,
  asset: 'villager_3_asset',
  pos: { x: -15, y: 4 },
  basePos: { x: 0, y: 30 },
  villagerPath: [],
};

const villager4: VillagerJSON = {
  name: 'Gordon',
  _id: 'villager_4',
  type: 'miner',
  friends: ['villager_1'],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ['cosmetic_4'], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: 'house_4',
  assignment: null,
  asset: 'villager_4_asset',
  pos: { x: 1, y: -11 },
  basePos: { x: -30, y: 0 },
  villagerPath: [],
};

const villager5: VillagerJSON = {
  name: 'Lachlan',
  _id: 'villager_5',
  type: 'miner',
  friends: ['villager_1'],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ['cosmetic_5'], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: 'house_5',
  assignment: null,
  asset: 'villager_5_asset',
  pos: { x: 5, y: 1 },
  basePos: { x: 0, y: -30 },
  villagerPath: [],
};

const villager6: VillagerJSON = {
  name: 'Nicole',
  _id: 'villager_6',
  type: 'miner',
  friends: ['villager_1'],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ['cosmetic_6'], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: 'house_6',
  assignment: null,
  asset: 'villager_6_asset',
  pos: { x: -8, y: 1 },
  basePos: { x: -34, y: 30 },
  villagerPath: [],
};

const villager7: VillagerJSON = {
  name: 'Jess',
  _id: 'villager_7',
  type: 'miner',
  friends: ['villager_1'],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ['cosmetic_7'], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: 'house_7',
  assignment: null,
  asset: 'villager_6_asset',
  pos: { x: -8, y: 3 },
  basePos: { x: 38, y: -37 },
  villagerPath: [],
};

const villager8: VillagerJSON = {
  name: 'Dylan H',
  _id: 'villager_8',
  type: 'miner',
  friends: ['villager_1'],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ['cosmetic_8'], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: 'house_8',
  assignment: null,
  asset: 'villager_8_asset',
  pos: { x: -8, y: 5 },
  basePos: { x: 38, y: 37 },
  villagerPath: [],
};

const attribute1: AttributeJSON = {
  _id: 'Strength',
  name: 'Strength',
};

const attribute2: AttributeJSON = {
  _id: 'Speed',
  name: 'Speed',
};

const attribute3: AttributeJSON = {
  _id: 'Stamina',
  name: 'Stamina',
};

const attribute4: AttributeJSON = {
  _id: 'Intelligence',
  name: 'Intelligence',
};

const attribute5: AttributeJSON = {
  _id: 'Charisma',
  name: 'Charisma',
};

const attribute6: AttributeJSON = {
  _id: 'Dexterity',
  name: 'Dexterity',
};

const attribute7: AttributeJSON = {
  _id: 'Perception',
  name: 'Perception',
};

const attribute8: AttributeJSON = {
  _id: 'Negotation',
  name: 'Negotation',
};

const attribute9: AttributeJSON = {
  _id: 'Luck',
  name: 'Luck',
};

const house1: HouseObjectJSON = {
  _id: 'house_1',
  name: "Villager 1's house",
  asset: 'house_1_asset',
  owner: 'villager_1',
  pos: { x: 0, y: 0 },
  enviroType: EnviroObjectType.HOUSE,
};

const house2: HouseObjectJSON = {
  _id: 'house_2',
  name: "Villager 2's house",
  asset: 'house_2_asset',
  owner: 'villager_2',
  pos: { x: 36, y: 8 },
  enviroType: EnviroObjectType.HOUSE,
};

const house3: HouseObjectJSON = {
  _id: 'house_3',
  name: "Villager 3's house",
  asset: 'house_3_asset',
  owner: 'villager_3',
  pos: { x: 0, y: 30 },
  enviroType: EnviroObjectType.HOUSE,
};

const house4: HouseObjectJSON = {
  _id: 'house_4',
  name: "Villager 4's house",
  asset: 'house_4_asset',
  owner: 'villager_4',
  pos: { x: -30, y: 0 },
  enviroType: EnviroObjectType.HOUSE,
};

const house5: HouseObjectJSON = {
  _id: 'house_5',
  name: "Villager 5's house",
  asset: 'house_5_asset',
  owner: 'villager_5',
  pos: { x: 0, y: -30 },
  enviroType: EnviroObjectType.HOUSE,
};

const house6: HouseObjectJSON = {
  _id: 'house_6',
  name: "Villager 6's house",
  asset: 'house_6_asset',
  owner: 'villager_6',
  pos: { x: -34, y: 30 },
  enviroType: EnviroObjectType.HOUSE,
};

const house7: HouseObjectJSON = {
  _id: 'house_7',
  name: "Villager 7's house",
  asset: 'house_7_asset',
  owner: 'villager_7',
  pos: { x: 38, y: -37 },
  enviroType: EnviroObjectType.HOUSE,
};

const house8: HouseObjectJSON = {
  _id: 'house_8',
  name: "Villager 8's house",
  asset: 'house_8_asset',
  owner: 'villager_8',
  pos: { x: 40, y: 37 },
  enviroType: EnviroObjectType.HOUSE,
};

const production1: ProductionObjectJSON = {
  _id: 'production_1',
  name: 'Wind Mill',
  asset: 'production_1_asset',
  resourceProductionProportions: {
    resource_1: 0.8,
    resource_2: 0.2,
  },
  workerCapacity: 3, // At most 3 villagers can work here simultaneously
  energyReserve: 1400, // The total amount of energy currently stored in this
  // object which can be transformed into resources. Once this energy reserve
  // is depleted, the production object will stop producing resources until
  // it is replenished with more energy (through time).
  pos: { x: -16, y: -14 },
  enviroType: EnviroObjectType.PRODUCTION,
};

const production2: ProductionObjectJSON = {
  _id: 'production_2',
  name: 'Brewery',
  asset: 'production_2_asset',
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
  pos: { x: -10, y: 15 },
  enviroType: EnviroObjectType.PRODUCTION,
};

const production3: ProductionObjectJSON = {
  _id: 'production_3',
  name: 'Wheat Farm',
  asset: 'production_3_asset',
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
  pos: { x: 18, y: -18 },
  enviroType: EnviroObjectType.PRODUCTION,
};

const production4: ProductionObjectJSON = {
  _id: 'production_4',
  name: 'Chicken Coop',
  asset: 'production_4_asset',
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
  pos: { x: 13, y: 18 },
  enviroType: EnviroObjectType.PRODUCTION,
};

const production5: ProductionObjectJSON = {
  _id: 'production_5',
  name: 'Tavern',
  asset: 'production_5_asset',
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
  pos: { x: 15, y: 1 },
  enviroType: EnviroObjectType.PRODUCTION,
};
const production6: ProductionObjectJSON = {
  _id: 'production_6',
  name: 'Tavern',
  asset: 'production_6_asset',
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
  pos: { x: 33, y: -12 },
  enviroType: EnviroObjectType.PRODUCTION,
};
const production7: ProductionObjectJSON = {
  _id: 'production_7',
  name: 'Tavern',
  asset: 'production_7_asset',
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
  pos: { x: 18, y: 30 },
  enviroType: EnviroObjectType.PRODUCTION,
};
const production8: ProductionObjectJSON = {
  _id: 'production_8',
  name: 'Tavern',
  asset: 'production_8_asset',
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
  pos: { x: -42, y: -27 },
  enviroType: EnviroObjectType.PRODUCTION,
};
const production9: ProductionObjectJSON = {
  _id: 'production_9',
  name: 'Tavern',
  asset: 'production_9_asset',
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
  pos: { x: -15, y: 32 },
  enviroType: EnviroObjectType.PRODUCTION,
};

const cosmetic1: CosmeticObjectJSON = {
  _id: 'cosmetic_1',
  name: 'Statue of Light',
  asset: 'cosmetic_1_asset',
  pos: { x: 0, y: 7 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: 'villager_1',
};

const cosmetic2: CosmeticObjectJSON = {
  _id: 'cosmetic_2',
  name: 'Bell Tower',
  asset: 'cosmetic_2_asset',
  pos: { x: 36, y: 15 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: 'villager_2',
};
const cosmetic3: CosmeticObjectJSON = {
  _id: 'cosmetic_3',
  name: 'Garden Swing',
  asset: 'cosmetic_3_asset',
  pos: { x: -40, y: -42 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: null,
};
const cosmetic4: CosmeticObjectJSON = {
  _id: 'cosmetic_4',
  name: 'Flower Tree',
  asset: 'cosmetic_4_asset',
  pos: { x: -30, y: 7 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: 'villager_4',
};
const cosmetic5: CosmeticObjectJSON = {
  _id: 'cosmetic_5',
  name: 'Grocer',
  asset: 'cosmetic_5_asset',
  pos: { x: 0, y: -23 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: 'villager_5',
};
const cosmetic6: CosmeticObjectJSON = {
  _id: 'cosmetic_6',
  name: 'Water Well',
  asset: 'cosmetic_6_asset',
  pos: { x: -34, y: 37 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: 'villager_6',
};
const cosmetic7: CosmeticObjectJSON = {
  _id: 'cosmetic_7',
  name: 'Crystal Lamp',
  asset: 'cosmetic_7_asset',
  pos: { x: 45, y: -37 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: 'villager_7',
};
const cosmetic8: CosmeticObjectJSON = {
  _id: 'cosmetic_8',
  name: 'Log Bench',
  asset: 'cosmetic_8_asset',
  pos: { x: 12, y: 26 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: null,
};
const cosmetic9: CosmeticObjectJSON = {
  _id: 'cosmetic_9',
  name: 'Flower Garden',
  asset: 'cosmetic_9_asset',
  pos: { x: -5, y: -15 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: null,
};
const cosmetic10: CosmeticObjectJSON = {
  _id: 'cosmetic_10',
  name: 'Flower Garden',
  asset: 'cosmetic_10_asset',
  pos: { x: 21, y: -9 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: null,
};
const cosmetic11: CosmeticObjectJSON = {
  _id: 'cosmetic_11',
  name: 'Flower Garden',
  asset: 'cosmetic_11_asset',
  pos: { x: 7, y: -14 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: null,
};
const cosmetic12: CosmeticObjectJSON = {
  _id: 'cosmetic_12',
  name: 'Flower Garden',
  asset: 'cosmetic_12_asset',
  pos: { x: 38, y: 18 },
  enviroType: EnviroObjectType.COSMETIC,
  owner: null,
};

const resource1: ResourceJSON = {
  _id: 'resource_1',
  name: 'Wood',
  productionEnergyCostBasic: 7,
  consumptionEnergyGainBasic: 11,
  type: 'edible',
  attirbuteAffinity: ['Speed', 'Dexterity', 'Perception'],
  productionObject: 'production_1',
  asset: 'resource_1_asset',
};

const resource2: ResourceJSON = {
  _id: 'resource_2',
  name: 'Iron Ore',
  productionEnergyCostBasic: 8,
  consumptionEnergyGainBasic: 15,
  type: 'edible',
  attirbuteAffinity: ['Speed', 'Charisma', 'Stamina'],
  productionObject: 'production_2',
  asset: 'resource_2_asset',
};

const resource3: ResourceJSON = {
  _id: 'resource_3',
  name: 'Beer',
  productionEnergyCostBasic: 2,
  consumptionEnergyGainBasic: 13,
  type: 'edible',
  attirbuteAffinity: ['Speed', 'Strength', 'Negotiation'],
  productionObject: 'production_3',
  asset: 'resource_3_asset',
};

const resource4: ResourceJSON = {
  _id: 'resource_4',
  name: 'Bread',
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 5,
  type: 'edible',
  attirbuteAffinity: ['Speed', 'Intelligence', 'Dexterity'],
  productionObject: 'production_4',
  asset: 'resource_4_asset',
};

const resource5: ResourceJSON = {
  _id: 'resource_5',
  name: 'RoundWool',
  productionEnergyCostBasic: 9,
  consumptionEnergyGainBasic: 9,
  type: 'material',
  attirbuteAffinity: ['Speed', 'Negotiation', 'Luck'],
  productionObject: 'production_5',
  asset: 'resource_5_asset',
};

const resource6: ResourceJSON = {
  _id: 'resource_6',
  name: 'Sugar Cane',
  productionEnergyCostBasic: 6,
  consumptionEnergyGainBasic: 1,
  type: 'edible',
  attirbuteAffinity: ['Stamina', 'Strength', 'Perception'],
  productionObject: 'production_1',
  asset: 'resource_6_asset',
};

const resource7: ResourceJSON = {
  _id: 'resource_7',
  name: 'Coal Ore',
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 4,
  type: 'material',
  attirbuteAffinity: ['Strength', 'Charisma', 'Luck'],
  productionObject: 'production_2',
  asset: 'resource_7_asset',
};

const resource8: ResourceJSON = {
  _id: 'resource_8',
  name: 'Beef',
  productionEnergyCostBasic: 5,
  consumptionEnergyGainBasic: 13,
  type: 'edible',
  attirbuteAffinity: ['Strength', 'Luck', 'Dexterity'],
  productionObject: 'production_3',
  asset: 'resource_8_asset',
};

const resource9: ResourceJSON = {
  _id: 'resource_9',
  name: 'Bacon',
  productionEnergyCostBasic: 13,
  consumptionEnergyGainBasic: 2,
  type: 'edible',
  attirbuteAffinity: ['Strength', 'Speed', 'Intelligence'],
  productionObject: 'production_4',
  asset: 'resource_9_asset',
};

const resource10: ResourceJSON = {
  _id: 'resource_10',
  name: 'Glass',
  productionEnergyCostBasic: 1,
  consumptionEnergyGainBasic: 15,
  type: 'edible',
  attirbuteAffinity: ['Speed', 'Intelligence', 'Dexterity'],
  productionObject: 'production_5',
  asset: 'resource_10_asset',
};
const resource11: ResourceJSON = {
  _id: 'resource_11',
  name: 'Thread',
  productionEnergyCostBasic: 2,
  consumptionEnergyGainBasic: 12,
  type: 'edible',
  attirbuteAffinity: ['Speed', 'Negotiation', 'Luck'],
  productionObject: 'production_1',
  asset: 'resource_11_asset',
};
const resource12: ResourceJSON = {
  _id: 'resource_12',
  name: 'Cocoa',
  productionEnergyCostBasic: 3,
  consumptionEnergyGainBasic: 9,
  type: 'edible',
  attirbuteAffinity: ['Stamina', 'Strength', 'Perception'],
  productionObject: 'production_2',
  asset: 'resource_12_asset',
};
const resource13: ResourceJSON = {
  _id: 'resource_13',
  name: 'Soybean',
  productionEnergyCostBasic: 13,
  consumptionEnergyGainBasic: 10,
  type: 'edible',
  attirbuteAffinity: ['Strength', 'Charisma', 'Luck'],
  productionObject: 'production_3',
  asset: 'resource_13_asset',
};
const resource14: ResourceJSON = {
  _id: 'resource_14',
  name: 'Oil',
  productionEnergyCostBasic: 2,
  consumptionEnergyGainBasic: 5,
  type: 'edible',
  attirbuteAffinity: ['Strength', 'Luck', 'Dexterity'],
  productionObject: 'production_4',
  asset: 'resource_14_asset',
};
const resource15: ResourceJSON = {
  _id: 'resource_15',
  name: 'Salmon',
  productionEnergyCostBasic: 9,
  consumptionEnergyGainBasic: 14,
  type: 'edible',
  attirbuteAffinity: ['Stamina', 'Strength', 'Perception'],
  productionObject: 'production_5',
  asset: 'resource_15_asset',
};
const resource16: ResourceJSON = {
  _id: 'resource_16',
  name: 'Wheat',
  productionEnergyCostBasic: 8,
  consumptionEnergyGainBasic: 4,
  type: 'edible',
  attirbuteAffinity: ['Strength', 'Speed', 'Intelligence'],
  productionObject: 'production_1',
  asset: 'resource_16_asset',
};
const resource17: ResourceJSON = {
  _id: 'resource_17',
  name: 'Tin',
  productionEnergyCostBasic: 8,
  consumptionEnergyGainBasic: 9,
  type: 'edible',
  attirbuteAffinity: ['Speed', 'Intelligence', 'Dexterity'],
  productionObject: 'production_2',
  asset: 'resource_17_asset',
};

export const simulationState1: SimulationStateJSON = {
  _id: 'simulation_server_state',
  worldMap: worldMap,
  villagers: {
    villager_1: villager1,
    villager_2: villager2,
    villager_3: villager3,
    villager_4: villager4,
    villager_5: villager5,
    villager_6: villager6,
    villager_7: villager7,
    villager_8: villager8,
  },
  attributes: {
    Strength: attribute1,
    Speed: attribute2,
    Stamina: attribute3,
    Intelligence: attribute4,
    Charisma: attribute5,
    Dexterity: attribute6,
    Perception: attribute7,
    Negotiation: attribute8,
    Luck: attribute9,
  },
  enviroObjects: {
    house_1: house1,
    house_2: house2,
    house_3: house3,
    house_4: house4,
    house_5: house5,
    house_6: house6,
    house_7: house7,
    house_8: house8,
    production_1: production1,
    production_2: production2,
    production_3: production3,
    production_4: production4,
    production_5: production5,
    production_6: production6,
    production_7: production7,
    production_8: production8,
    production_9: production9,
    cosmetic_1: cosmetic1,
    cosmetic_2: cosmetic2,
    cosmetic_3: cosmetic3,
    cosmetic_4: cosmetic4,
    cosmetic_5: cosmetic5,
    cosmetic_6: cosmetic6,
    cosmetic_7: cosmetic7,
    cosmetic_8: cosmetic8,
    cosmetic_9: cosmetic9,
    cosmetic_10: cosmetic10,
    cosmetic_11: cosmetic11,
    cosmetic_12: cosmetic12,
    // cosmetic_13: cosmetic13,
    // cosmetic_14: cosmetic14,
    // cosmetic_15: cosmetic15,
  },
  resources: {
    resource_1: resource1,
    resource_2: resource2,
    resource_3: resource3,
    resource_4: resource4,
    resource_5: resource5,
    resource_6: resource6,
    resource_7: resource7,
    resource_8: resource8,
    resource_9: resource9,
    resource_10: resource10,
    resource_11: resource11,
    resource_12: resource12,
    resource_13: resource13,
    resource_14: resource14,
    resource_15: resource15,
    resource_16: resource16,
    resource_17: resource17,
  },
};

export const assets1: AssetsJSON = {
  house_1_asset: {
    _id: 'house_1_asset',
    name: 'Villager 1 House asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description:
      "A cute aesthetic standard isometric aerial view of a single large square villager's house. The villager's house is a charming fusion of medieval European timber-framed architecture and Japanese machiya townhouses. Its warm, honey-colored wooden beams crisscross over pristine white plaster walls, creating a tapestry of old-world charm. The steeply pitched roof is adorned with gently curving eaves, reminiscent of traditional Japanese craftsmanship, sheltering latticed windows that let golden sunlight spill into the cozy interiors..........",
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-23T03:30:14.011Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 10,
      dy: 10,
    },
  },
  house_2_asset: {
    _id: 'house_2_asset',
    name: 'Villager 2 House asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '...',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-23T03:18:39.540Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 10,
      dy: 10,
    },
  },
  house_3_asset: {
    _id: 'house_3_asset',
    name: 'Villager 8 House asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '...',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-23T03:32:13.825Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 10,
      dy: 10,
    },
  },
  house_4_asset: {
    _id: 'house_4_asset',
    name: 'Villager 4 House asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '...',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-30T22:48:15.471Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 10,
      dy: 10,
    },
  },
  house_5_asset: {
    _id: 'house_5_asset',
    name: 'Villager 5 House asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '...',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-23T03:28:11.539Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 10,
      dy: 10,
    },
  },
  house_6_asset: {
    _id: 'house_6_asset',
    name: 'Villager 6 House asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '...',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-31T02:05:38.543Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 10,
      dy: 10,
    },
  },
  house_7_asset: {
    _id: 'house_7_asset',
    name: 'Villager 7 House asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '...',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-31T01:42:14.636Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 10,
      dy: 10,
    },
  },
  house_8_asset: {
    _id: 'house_8_asset',
    name: 'Villager 8 House asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '...',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-31T01:58:02.316Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 10,
      dy: 10,
    },
  },
  production_1_asset: {
    _id: 'production_1_asset',
    name: 'Production Object 1 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T09:13:31.135Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 9,
      dy: 9,
    },
  },
  production_2_asset: {
    _id: 'production_2_asset',
    name: 'Production Object 2 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T09:11:42.669Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 7,
      dy: 7,
    },
  },
  production_3_asset: {
    _id: 'production_3_asset',
    name: 'Production Object 3 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T04:30:10.629Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  production_4_asset: {
    _id: 'production_4_asset',
    name: 'Production Object 4 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T04:52:25.102Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  production_5_asset: {
    _id: 'production_5_asset',
    name: 'Production Object 5 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T06:34:15.160Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  production_6_asset: {
    _id: 'production_6_asset',
    name: 'Production Object 6 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-31T00:25:50.926Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 7,
      dy: 7,
    },
  },
  production_7_asset: {
    _id: 'production_7_asset',
    name: 'Production Object 7 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-31T00:25:59.149Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 6,
      dy: 6,
    },
  },
  production_8_asset: {
    _id: 'production_8_asset',
    name: 'Production Object 8 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-31T01:30:50.651Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 9,
      dy: 9,
    },
  },
  production_9_asset: {
    _id: 'production_9_asset',
    name: 'Production Object 9 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-31T01:31:06.894Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  cosmetic_1_asset: {
    _id: 'cosmetic_1_asset',
    name: 'Cosmetic Object 1 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T02:53:28.789Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 3,
      dy: 3,
    },
  },
  cosmetic_2_asset: {
    _id: 'cosmetic_2_asset',
    name: 'Cosmetic Object 2 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T02:59:41.676Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 3,
      dy: 3,
    },
  },
  cosmetic_3_asset: {
    _id: 'cosmetic_3_asset',
    name: 'Cosmetic Object 3 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T03:01:24.141Z/edges-cropped2.png  ',
      },
    ],
    dimensions: {
      dx: 2,
      dy: 2,
    },
  },
  cosmetic_4_asset: {
    _id: 'cosmetic_4_asset',
    name: 'Cosmetic Object 4 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T03:04:56.349Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 3,
      dy: 3,
    },
  },
  cosmetic_5_asset: {
    _id: 'cosmetic_5_asset',
    name: 'Cosmetic Object 5 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T03:24:38.926Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  cosmetic_6_asset: {
    _id: 'cosmetic_6_asset',
    name: 'Cosmetic Object 6 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T03:10:19.277Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  cosmetic_7_asset: {
    _id: 'cosmetic_7_asset',
    name: 'Cosmetic Object 7 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T03:18:28.475Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 2,
      dy: 2,
    },
  },
  cosmetic_8_asset: {
    _id: 'cosmetic_8_asset',
    name: 'Cosmetic Object 8 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T03:27:28.808Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 2,
      dy: 2,
    },
  },
  cosmetic_9_asset: {
    _id: 'cosmetic_9_asset',
    name: 'Cosmetic Object 9 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/house-2024-05-21T03:30:17.284Z/edges-cropped2.png',
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  cosmetic_10_asset: {
    _id: 'cosmetic_10_asset',
    name: 'Cosmetic Object 10 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/COSMETIC_ENVIRONMENT_OBJ-2024-05-31T00:19:57.830Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  cosmetic_11_asset: {
    _id: 'cosmetic_11_asset',
    name: 'Cosmetic Object 11 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/COSMETIC_ENVIRONMENT_OBJ-2024-05-31T00:19:59.470Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  cosmetic_12_asset: {
    _id: 'cosmetic_12_asset',
    name: 'Cosmetic Object 12 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/COSMETIC_ENVIRONMENT_OBJ-2024-05-31T00:22:22.745Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 2,
      dy: 2,
    },
  },
  cosmetic_13_asset: {
    _id: 'cosmetic_13_asset',
    name: 'Cosmetic Object 13 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/COSMETIC_ENVIRONMENT_OBJ-2024-05-31T00:22:25.394Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  cosmetic_14_asset: {
    _id: 'cosmetic_14_asset',
    name: 'Cosmetic Object 14 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/COSMETIC_ENVIRONMENT_OBJ-2024-05-31T01:31:34.694Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 3,
      dy: 3,
    },
  },
  cosmetic_15_asset: {
    _id: 'cosmetic_15_asset',
    name: 'Cosmetic Object 15 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-31T01:31:42.813Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 5,
      dy: 5,
    },
  },
  villager_1_asset: {
    _id: 'villager_1_asset',
    name: 'Villager 1 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/elowen-removebg-preview.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_2_asset: {
    _id: 'villager_2_asset',
    name: 'Villager 2 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/barnaby-removebg-preview.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_3_asset: {
    _id: 'villager_3_asset',
    name: 'Villager 3 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/lykke-removebg-preview.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_4_asset: {
    _id: 'villager_4_asset',
    name: 'Villager 4 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/lykke-removebg-preview.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_5_asset: {
    _id: 'villager_5_asset',
    name: 'Villager 5 asset',
    date: '2024-05-31T08:47:19.538+10:0',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'edges-cropped.png',
        url: 'https://flatearth.b-cdn.net/villager-2024-05-30T22:47:19.535Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_6_asset: {
    _id: 'villager_6_asset',
    name: 'Villager 6 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/villager-2024-05-31T00:01:37.404Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_7_asset: {
    _id: 'villager_7_asset',
    name: 'Villager 7 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/villager-2024-05-31T00:12:10.082Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_8_asset: {
    _id: 'villager_8_asset',
    name: 'Villager 8 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/farid-removebg-preview.png',
      }, //TODO: change this dupliacte
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_1_asset: {
    _id: 'resource_1_asset',
    name: 'Resource 1 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T22:43:08.341Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_2_asset: {
    _id: 'resource_2_asset',
    name: 'Resource 2 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T22:57:44.145Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_3_asset: {
    _id: 'resource_3_asset',
    name: 'Resource 3 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T22:58:12.497Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_4_asset: {
    _id: 'resource_4_asset',
    name: 'Resource 4 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T22:57:44.145Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_5_asset: {
    _id: 'resource_5_asset',
    name: 'Resource 5 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T22:58:42.884Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_6_asset: {
    _id: 'resource_6_asset',
    name: 'Resource 6 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T22:59:13.541Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_7_asset: {
    _id: 'resource_7_asset',
    name: 'Resource 7 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T22:59:48.651Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_8_asset: {
    _id: 'resource_8_asset',
    name: 'Resource 8 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:00:14.168Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_9_asset: {
    _id: 'resource_9_asset',
    name: 'Resource 9 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:00:42.141Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_10_asset: {
    _id: 'resource_10_asset',
    name: 'Resource 10 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:02:07.321Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_11_asset: {
    _id: 'resource_11_asset',
    name: 'Resource 11 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:02:34.606Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_12_asset: {
    _id: 'resource_12_asset',
    name: 'Resource 12 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:03:37.182Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_13_asset: {
    _id: 'resource_13_asset',
    name: 'Resource 13 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:15:23.347Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_14_asset: {
    _id: 'resource_14_asset',
    name: 'Resource 14 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:14:27.476Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_15_asset: {
    _id: 'resource_15_asset',
    name: 'Resource 15 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:18:52.780Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_16_asset: {
    _id: 'resource_16_asset',
    name: 'Resource 16 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:18:52.780Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_17_asset: {
    _id: 'resource_17_asset',
    name: 'Resource 17 asset',
    date: '2024-05-21T18:23:42.555+10:00',
    description: '..........',
    type: 'png',
    remoteImages: [
      {
        name: 'final.png',
        url: 'https://flatearth.b-cdn.net/production-2024-05-28T23:21:00.530Z/edges-cropped.png',
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
};

// Fill CellsJson with correct owner
for (const [villagerId, villager] of Object.entries(
  simulationState1.villagers
)) {
  if (
    checkGridCellsJSON(
      simulationState1.worldMap.cells,
      villager.basePos,
      VILLAGER_PLOT_DIM,
      null,
      false, // not checking objects
      null, // make sure not owned by anyone currently
      true
    )
  ) {
    fillGridCellsJSON(
      simulationState1.worldMap.cells,
      villager.basePos,
      VILLAGER_PLOT_DIM,
      null,
      false,
      villagerId,
      true
    );
  } else {
    throw Error(
      `Villager plot centered at ${villager.basePos.x},${villager.basePos.y} overlaps with another plot`
    );
  }
}

// Manually defined cells. Will be automatically filled into the worldmap cells
// const manualCells: CellsJSON = {
//   "0,0": {
//     // prefereably center of villager's plot
//     owner: "villager_1",
//     object: "house_1",
//   },
//   "36,8": {
//     owner: "villager_2",
//     object: "house_2",
//   },
//   "0,30": {
//     owner: "villager_3",
//     object: "house_3",
//   },
//   "-30,0": {
//     owner: "villager_4",
//     object: "house_4",
//   },
//   "0,-30": {
//     owner: "villager_5",
//     object: "house_5",
//   },
//   "-34,30": {
//     owner: "villager_6",
//     object: "house_6",
//   },
//   "38,-37": {
//     owner: "villager_7",
//     object: "house_7",
//   },
//   "38,37": {
//     owner: "villager_8",
//     object: "house_8",
//   },
//   "0, 7": {
//     owner: "villager_1",
//     object: "cosmetic_1",
//   },
//   "36,15": {
//     owner: "villager_2",
//     object: "cosmetic_2",
//   },
//   "0,37": {
//     owner: "villager_3",
//     object: "cosmetic_3",
//   },
//   "-30,7": {
//     owner: "villager_4",
//     object: "cosmetic_4",
//   },
//   "0,-23": {
//     owner: "villager_5",
//     object: "cosmetic_5",
//   },
//   "-34,37": {
//     owner: "villager_6",
//     object: "cosmetic_6",
//   },
//   "45,-37": {
//     owner: "villager_7",
//     object: "cosmetic_7",
//   },
//   "38,44": {
//     owner: "villager_8",
//     object: "cosmetic_8",
//   },
//   "21,-7": {
//     owner: null,
//     object: "cosmetic_9",
//   },
//   "-18,-18": {
//     owner: null,
//     object: "production_1",
//   },
//   "-18,18": {
//     owner: null,
//     object: "production_2",
//   },
//   "18,-18": {
//     owner: null,
//     object: "production_3",
//   },
//   "13,18": {
//     owner: null,
//     object: "production_4",
//   },
//   "13,-10": {
//     owner: null,
//     object: "production_5",
//   },
// };

// Fill the worldmap cells with the envrionemnt objects
for (const [enviroObjectId, enviroObjectJson] of Object.entries(
  simulationState1.enviroObjects
) as Entries<Record<EnviroObjectId, EnviroObjectJSON>>) {
  const pos = enviroObjectJson.pos;
  console.log(
    // @ts-ignore
    `Check and fill worldmap cells at ${pos.x},${pos.y} with enviroobject ${enviroObjectId}`
  );

  const assetId = enviroObjectJson.asset;
  // @ts-ignore
  const dim = assets1[assetId].dimensions;

  // Check manual cell owner corresponds to actual owner
  if (
    isHouseObjectJSON(enviroObjectJson) ||
    isCosmeticObjectJSON(enviroObjectJson)
  ) {
    if (
      !checkGridCellsJSON(
        simulationState1.worldMap.cells,
        // @ts-ignore
        pos,
        dim,
        null,
        false,
        enviroObjectJson.owner,
        true
      )
    ) {
      throw Error(
        // @ts-ignore
        `House/Cosmetic object owned by ${enviroObjectJson.owner} cannot be placed at ${pos.x},${pos.y} the surroding plot is not owned by that owner`
      );
    }
  } else if (isProductionObjectJSON(enviroObjectJson)) {
    if (
      !checkGridCellsJSON(
        simulationState1.worldMap.cells,
        // @ts-ignore
        pos,
        dim,
        null,
        false,
        null,
        true // production object must be placed where nobodyowns the land
      )
    ) {
      throw Error(
        // @ts-ignore
        `Production object cannot be placed at ${pos.x},${pos.y} which the plot surroudning overlaps with owned land`
      );
    }
  }

  if (
    checkGridCellsJSON(
      simulationState1.worldMap.cells,
      // @ts-ignore
      pos,
      dim,
      null,
      true, // make sure no object is there
      null,
      false // already check that the plot of land for object is owned by correct owner (or unowned)
    )
  ) {
    fillGridCellsJSON(
      simulationState1.worldMap.cells,
      // @ts-ignore
      pos,
      dim,
      enviroObjectId,
      true,
      null,
      false
    );
  } else {
    throw Error(
      // @ts-ignore
      `Failed to fill grid cells json for enviro object ${enviroObjectId} at ${pos.x},${pos.y} with dimensions ${dim.dx},${dim.dy} as it overlaps with another object`
    );
  }
}
