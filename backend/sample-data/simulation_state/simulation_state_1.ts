import { AssetsJSON } from "@backend/types/assetTypes.ts";
import {
  AttributeJSON,
  CosmeticObjectJSON,
  HouseObjectJSON,
  ProductionObjectJSON,
  ResourceJSON,
  SimulationStateJSON,
  VillagerJSON,
  WorldMapJSON,
} from "@backend/types/simulationTypes.ts";
import { cells } from "./map_vis_cells_1.ts";

export const worldMap: WorldMapJSON = {
  cells: {
    ...cells,
    "0,0": {
      owner: "villager_1",
      object: "house_1",
    },
    "18,4": {
      owner: "villager_2",
      object: "house_2",
    },
    "0,15": {
      owner: "villager_3",
      object: "house_3",
    },
    "-15,0": {
      owner: "villager_4",
      object: "house_4",
    },
    "0,-15": {
      owner: "villager_5",
      object: "house_5",
    },
    "-12, 20": {
      owner: null,
      object: "cosmetic_1",
    },
    "6,6": {
      owner: null,
      object: "cosmetic_2",
    },
    "-12,12": {
      owner: null,
      object: "cosmetic_3",
    },
    "-16,-10": {
      owner: null,
      object: "cosmetic_4",
    },
    "10,2": {
      owner: null,
      object: "cosmetic_5",
    },
    "-8,20": {
      owner: null,
      object: "cosmetic_6",
    },
    "-9,-12": {
      owner: null,
      object: "cosmetic_7",
    },
    "6,-22": {
      owner: null,
      object: "cosmetic_8",
    },
    "21,-7": {
      owner: null,
      object: "cosmetic_9",
    },
    "-18,-18": {
      owner: null,
      object: "production_1",
    },
    "-18,18": {
      owner: null,
      object: "production_2",
    },
    "18,-18": {
      owner: null,
      object: "production_3",
    },
    "13,18": {
      owner: null,
      object: "production_4",
    },
    "13,-10": {
      owner: null,
      object: "production_5",
    },
  },
};

const villager1: VillagerJSON = {
  _id: "villager_1",
  type: "farmer",
  friends: ["villager_2"],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_1",
  assignment: null,
  asset: "villager_1_asset",
  pos: { x: 1, y: 5 }, // in front of house_1
};

const villager2: VillagerJSON = {
  _id: "villager_2",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_2"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_2",
  assignment: null,
  asset: "villager_2_asset",
  pos: { x: 18, y: 8 },
};

const villager3: VillagerJSON = {
  _id: "villager_3",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_3"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_3",
  assignment: null,
  asset: "villager_3_asset",
  pos: { x: -15, y: 4 },
};

const villager4: VillagerJSON = {
  _id: "villager_4",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_4"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_4",
  assignment: null,
  asset: "villager_4_asset",
  pos: { x: 1, y: -11 },
};

const villager5: VillagerJSON = {
  _id: "villager_5",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_5"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_5",
  assignment: null,
  asset: "villager_5_asset",
  pos: { x: 5, y: 1 },
};

const villager6: VillagerJSON = {
  _id: "villager_6",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_6"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_6",
  assignment: null,
  asset: "villager_6_asset",
  pos: { x: -8, y: 1 },
};

const villager7: VillagerJSON = {
  _id: "villager_7",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_7"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_7",
  assignment: null,
  asset: "villager_6_asset",
  pos: { x: -8, y: 3 },
};

const villager8: VillagerJSON = {
  _id: "villager_8",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 75,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_8"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_8",
  assignment: null,
  asset: "villager_8_asset",
  pos: { x: -8, y: 5 },
};

const attribute1: AttributeJSON = {
  _id: "Strength",
  name: "Strength",
};

const attribute2: AttributeJSON = {
  _id: "Speed",
  name: "Speed",
};

const attribute3: AttributeJSON = {
  _id: "Stamina",
  name: "Stamina",
};

const attribute4: AttributeJSON = {
  _id: "Intelligence",
  name: "Intelligence",
};

const attribute5: AttributeJSON = {
  _id: "Charisma",
  name: "Charisma",
};

const attribute6: AttributeJSON = {
  _id: "Dexterity",
  name: "Dexterity",
};

const attribute7: AttributeJSON = {
  _id: "Perception",
  name: "Perception",
};

const attribute8: AttributeJSON = {
  _id: "Negotation",
  name: "Negotation",
};

const attribute9: AttributeJSON = {
  _id: "Luck",
  name: "Luck",
};

const house1: HouseObjectJSON = {
  _id: "house_1",
  name: "Villager 1's house",
  asset: "house_1_asset",
  owner: "villager_1",
};

const house2: HouseObjectJSON = {
  _id: "house_2",
  name: "Villager 2's house",
  asset: "house_2_asset",
  owner: "villager_2",
};

const house3: HouseObjectJSON = {
  _id: "house_3",
  name: "Villager 3's house",
  asset: "house_3_asset",
  owner: "villager_3",
};

const house4: HouseObjectJSON = {
  _id: "house_4",
  name: "Villager 4's house",
  asset: "house_4_asset",
  owner: "villager_4",
};

const house5: HouseObjectJSON = {
  _id: "house_5",
  name: "Villager 5's house",
  asset: "house_5_asset",
  owner: "villager_5",
};

const house6: HouseObjectJSON = {
  _id: "house_6",
  name: "Villager 6's house",
  asset: "house_6_asset",
  owner: "villager_6",
};

const house7: HouseObjectJSON = {
  _id: "house_7",
  name: "Villager 7's house",
  asset: "house_7_asset",
  owner: "villager_7",
};

const house8: HouseObjectJSON = {
  _id: "house_8",
  name: "Villager 8's house",
  asset: "house_8_asset",
  owner: "villager_8",
};

const production1: ProductionObjectJSON = {
  _id: "production_1",
  name: "Wind Mill",
  asset: "production_1_asset",
  resourceProductionProportions: {
    resource_1: 0.8,
    resource_2: 0.2,
  },
  workerCapacity: 3, // At most 3 villagers can work here simultaneously
  energyReserve: 1400, // The total amount of energy currently stored in this
  // object which can be transformed into resources. Once this energy reserve
  // is depleted, the production object will stop producing resources until
  // it is replenished with more energy (through time).
};

const production2: ProductionObjectJSON = {
  _id: "production_2",
  name: "Brewery",
  asset: "production_2_asset",
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
};

const production3: ProductionObjectJSON = {
  _id: "production_3",
  name: "Wheat Farm",
  asset: "production_3_asset",
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
};

const production4: ProductionObjectJSON = {
  _id: "production_4",
  name: "Chicken Coop",
  asset: "production_4_asset",
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
};

const production5: ProductionObjectJSON = {
  _id: "production_5",
  name: "Tavern",
  asset: "production_5_asset",
  resourceProductionProportions: {
    resource_2: 0.3,
    resource_3: 0.7,
  },
  workerCapacity: 2,
  energyReserve: 1700,
};

const cosmetic1: CosmeticObjectJSON = {
  _id: "cosmetic_1",
  name: "Statue of Light",
  asset: "cosmetic_1_asset",
};

const cosmetic2: CosmeticObjectJSON = {
  _id: "cosmetic_2",
  name: "Bell Tower",
  asset: "cosmetic_2_asset",
};
const cosmetic3: CosmeticObjectJSON = {
  _id: "cosmetic_3",
  name: "Garden Swing",
  asset: "cosmetic_3_asset",
};
const cosmetic4: CosmeticObjectJSON = {
  _id: "cosmetic_4",
  name: "Flower Tree",
  asset: "cosmetic_4_asset",
};
const cosmetic5: CosmeticObjectJSON = {
  _id: "cosmetic_5",
  name: "Grocer",
  asset: "cosmetic_5_asset",
};
const cosmetic6: CosmeticObjectJSON = {
  _id: "cosmetic_6",
  name: "Water Well",
  asset: "cosmetic_6_asset",
};
const cosmetic7: CosmeticObjectJSON = {
  _id: "cosmetic_7",
  name: "Crystal Lamp",
  asset: "cosmetic_7_asset",
};
const cosmetic8: CosmeticObjectJSON = {
  _id: "cosmetic_8",
  name: "Log Bench",
  asset: "cosmetic_8_asset",
};
const cosmetic9: CosmeticObjectJSON = {
  _id: "cosmetic_9",
  name: "Flower Garden",
  asset: "cosmetic_9_asset",
};

const resource1: ResourceJSON = {
  _id: "resource_1",
  name: "Wood",
  productionEnergyCostBasic: 7,
  consumptionEnergyGainBasic: 11,
  type: "edible",
  attirbuteAffinity: ["Speed", "Dexterity", "Perception"],
  productionObject: "production_1",
};

const resource2: ResourceJSON = {
  _id: "resource_2",
  name: "Iron Ore",
  productionEnergyCostBasic: 8,
  consumptionEnergyGainBasic: 15,
  type: "edible",
  attirbuteAffinity: ["Speed", "Charisma", "Stamina"],
  productionObject: "production_2",
};

const resource3: ResourceJSON = {
  _id: "resource_3",
  name: "Beer",
  productionEnergyCostBasic: 2,
  consumptionEnergyGainBasic: 13,
  type: "edible",
  attirbuteAffinity: ["Speed", "Strength", "Negotiation"],
  productionObject: "production_3",
};

const resource4: ResourceJSON = {
  _id: "resource_4",
  name: "Bread",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 5,
  type: "edible",
  attirbuteAffinity: ["Speed", "Intelligence", "Dexterity"],
  productionObject: "production_4",
};

const resource5: ResourceJSON = {
  _id: "resource_5",
  name: "RoundWool",
  productionEnergyCostBasic: 9,
  consumptionEnergyGainBasic: 9,
  type: "material",
  attirbuteAffinity: ["Speed", "Negotiation", "Luck"],
  productionObject: "production_5",
};

const resource6: ResourceJSON = {
  _id: "resource_6",
  name: "Sugar Cane",
  productionEnergyCostBasic: 6,
  consumptionEnergyGainBasic: 1,
  type: "edible",
  attirbuteAffinity: ["Stamina", "Strength", "Perception"],
  productionObject: "production_1",
};

const resource7: ResourceJSON = {
  _id: "resource_7",
  name: "Coal Ore",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 4,
  type: "material",
  attirbuteAffinity: ["Strength", "Charisma", "Luck"],
  productionObject: "production_2",
};

const resource8: ResourceJSON = {
  _id: "resource_8",
  name: "Beef",
  productionEnergyCostBasic: 5,
  consumptionEnergyGainBasic: 13,
  type: "edible",
  attirbuteAffinity: ["Strength", "Luck", "Dexterity"],
  productionObject: "production_3",
};

const resource9: ResourceJSON = {
  _id: "resource_9",
  name: "Bacon",
  productionEnergyCostBasic: 13,
  consumptionEnergyGainBasic: 2,
  type: "edible",
  attirbuteAffinity: ["Strength", "Speed", "Intelligence"],
  productionObject: "production_4",
};

const resource10: ResourceJSON = {
  _id: "resource_10",
  name: "Glass",
  productionEnergyCostBasic: 1,
  consumptionEnergyGainBasic: 15,
  type: "edible",
  attirbuteAffinity: ["Speed", "Intelligence", "Dexterity"],
  productionObject: "production_5",
};
const resource11: ResourceJSON = {
  _id: "resource_11",
  name: "Thread",
  productionEnergyCostBasic: 2,
  consumptionEnergyGainBasic: 12,
  type: "edible",
  attirbuteAffinity: ["Speed", "Negotiation", "Luck"],
  productionObject: "production_1",
};
const resource12: ResourceJSON = {
  _id: "resource_12",
  name: "Cocoa",
  productionEnergyCostBasic: 3,
  consumptionEnergyGainBasic: 9,
  type: "edible",
  attirbuteAffinity: ["Stamina", "Strength", "Perception"],
  productionObject: "production_2",
};
const resource13: ResourceJSON = {
  _id: "resource_13",
  name: "Soybean",
  productionEnergyCostBasic: 13,
  consumptionEnergyGainBasic: 10,
  type: "edible",
  attirbuteAffinity: ["Strength", "Charisma", "Luck"],
  productionObject: "production_3",
};
const resource14: ResourceJSON = {
  _id: "resource_14",
  name: "Oil",
  productionEnergyCostBasic: 2,
  consumptionEnergyGainBasic: 5,
  type: "edible",
  attirbuteAffinity: ["Strength", "Luck", "Dexterity"],
  productionObject: "production_4",
};
const resource15: ResourceJSON = {
  _id: "resource_15",
  name: "Salmon",
  productionEnergyCostBasic: 9,
  consumptionEnergyGainBasic: 14,
  type: "edible",
  attirbuteAffinity: ["Stamina", "Strength", "Perception"],

  productionObject: "production_5",
};
const resource16: ResourceJSON = {
  _id: "resource_16",
  name: "Wheat",
  productionEnergyCostBasic: 8,
  consumptionEnergyGainBasic: 4,
  type: "edible",
  attirbuteAffinity: ["Strength", "Speed", "Intelligence"],
  productionObject: "production_1",
};
const resource17: ResourceJSON = {
  _id: "resource_17",
  name: "Tin",
  productionEnergyCostBasic: 8,
  consumptionEnergyGainBasic: 9,
  type: "edible",
  attirbuteAffinity: ["Speed", "Intelligence", "Dexterity"],
  productionObject: "production_2",
};

export const simulationState1: SimulationStateJSON = {
  _id: "simulation_server_state",
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
    production_1: production1,
    production_2: production2,
    production_3: production3,
    production_4: production4,
    production_5: production5,
    cosmetic_1: cosmetic1,
    cosmetic_2: cosmetic2,
    cosmetic_3: cosmetic3,
    cosmetic_4: cosmetic4,
    cosmetic_5: cosmetic5,
    cosmetic_6: cosmetic6,
    cosmetic_7: cosmetic7,
    cosmetic_8: cosmetic8,
    cosmetic_9: cosmetic9,
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
    _id: "house_1_asset",
    name: "Villager 1 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description:
      "A cute aesthetic standard isometric aerial view of a single large square villager's house. The villager's house is a charming fusion of medieval European timber-framed architecture and Japanese machiya townhouses. Its warm, honey-colored wooden beams crisscross over pristine white plaster walls, creating a tapestry of old-world charm. The steeply pitched roof is adorned with gently curving eaves, reminiscent of traditional Japanese craftsmanship, sheltering latticed windows that let golden sunlight spill into the cozy interiors..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-23T03:30:14.011Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  house_2_asset: {
    _id: "house_2_asset",
    name: "Villager 2 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "...",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-23T03:18:39.540Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  house_3_asset: {
    _id: "house_3_asset",
    name: "Villager 8 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "...",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-23T03:32:13.825Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  house_4_asset: {
    _id: "house_4_asset",
    name: "Villager 4 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "...",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-23T03:26:14.187Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  house_5_asset: {
    _id: "house_5_asset",
    name: "Villager 5 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "...",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-23T03:28:11.539Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  house_6_asset: {
    _id: "house_6_asset",
    name: "Villager 6 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "...",
    type: "png",
    remoteImages: [
      {
        name: "original.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/original.png",
      },
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  production_1_asset: {
    _id: "production_1_asset",
    name: "Production Object 1 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T09:13:31.135Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 9,
      dy: 9,
    },
  },
  production_2_asset: {
    _id: "production_2_asset",
    name: "Production Object 2 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T09:11:42.669Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 7,
      dy: 7,
    },
  },
  production_3_asset: {
    _id: "production_3_asset",
    name: "Production Object 3 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T04:30:10.629Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  production_4_asset: {
    _id: "production_4_asset",
    name: "Production Object 4 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T04:52:25.102Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  production_5_asset: {
    _id: "production_5_asset",
    name: "Production Object 5 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/RESOURCE_ENVIRONMENT_OBJ-2024-05-23T06:34:15.160Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 8,
      dy: 8,
    },
  },
  cosmetic_1_asset: {
    _id: "cosmetic_1_asset",
    name: "Cosmetic Object 1 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T02:53:28.789Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 3,
      dy: 3,
    },
  },
  cosmetic_2_asset: {
    _id: "cosmetic_2_asset",
    name: "Cosmetic Object 2 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T02:59:41.676Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 3,
      dy: 3,
    },
  },
  cosmetic_3_asset: {
    _id: "cosmetic_3_asset",
    name: "Cosmetic Object 3 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T03:01:24.141Z/edges-cropped2.png  ",
      },
    ],
    dimensions: {
      dx: 2,
      dy: 2,
    },
  },
  cosmetic_4_asset: {
    _id: "cosmetic_4_asset",
    name: "Cosmetic Object 4 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T03:04:56.349Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 3,
      dy: 3,
    },
  },
  cosmetic_5_asset: {
    _id: "cosmetic_5_asset",
    name: "Cosmetic Object 5 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T03:24:38.926Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  cosmetic_6_asset: {
    _id: "cosmetic_6_asset",
    name: "Cosmetic Object 6 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T03:10:19.277Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  cosmetic_7_asset: {
    _id: "cosmetic_7_asset",
    name: "Cosmetic Object 7 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T03:18:28.475Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 2,
      dy: 2,
    },
  },
  cosmetic_8_asset: {
    _id: "cosmetic_8_asset",
    name: "Cosmetic Object 8 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T03:27:28.808Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 2,
      dy: 2,
    },
  },
  cosmetic_9_asset: {
    _id: "cosmetic_9_asset",
    name: "Cosmetic Object 9 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-21T03:30:17.284Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      dx: 4,
      dy: 4,
    },
  },
  villager_1_asset: {
    _id: "villager_1_asset",
    name: "Villager 1 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/elowen-removebg-preview.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_2_asset: {
    _id: "villager_2_asset",
    name: "Villager 2 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/barnaby-removebg-preview.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_3_asset: {
    _id: "villager_3_asset",
    name: "Villager 3 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/lykke-removebg-preview.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_4_asset: {
    _id: "villager_4_asset",
    name: "Villager 4 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/lykke-removebg-preview.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_5_asset: {
    _id: "villager_5_asset",
    name: "Villager 5 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/farid-removebg-preview.png",
      }, // TODO: change this dupliacte
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_6_asset: {
    _id: "villager_6_asset",
    name: "Villager 6 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/farid-removebg-preview.png",
      }, //TODO: change this dupliacte
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_7_asset: {
    _id: "villager_7_asset",
    name: "Villager 7 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/farid-removebg-preview.png",
      }, // TODO: change this dupliacte
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  villager_8_asset: {
    _id: "villager_8_asset",
    name: "Villager 8 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/VILLAGER-2024-05-25T20:40/farid-removebg-preview.png",
      }, //TODO: change this dupliacte
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_1_asset: {
    _id: "resource_1_asset",
    name: "Resource 1 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T22:43:08.341Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_2_asset: {
    _id: "resource_2_asset",
    name: "Resource 2 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T22:57:44.145Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_3_asset: {
    _id: "resource_3_asset",
    name: "Resource 3 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T22:58:12.497Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_4_asset: {
    _id: "resource_4_asset",
    name: "Resource 4 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T22:57:44.145Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_5_asset: {
    _id: "resource_5_asset",
    name: "Resource 5 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T22:58:42.884Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_6_asset: {
    _id: "resource_6_asset",
    name: "Resource 6 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T22:59:13.541Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_7_asset: {
    _id: "resource_7_asset",
    name: "Resource 7 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T22:59:48.651Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_8_asset: {
    _id: "resource_8_asset",
    name: "Resource 8 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:00:14.168Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_9_asset: {
    _id: "resource_9_asset",
    name: "Resource 9 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:00:42.141Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_10_asset: {
    _id: "resource_10_asset",
    name: "Resource 10 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:02:07.321Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_11_asset: {
    _id: "resource_11_asset",
    name: "Resource 11 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:02:34.606Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_12_asset: {
    _id: "resource_12_asset",
    name: "Resource 12 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:03:37.182Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_13_asset: {
    _id: "resource_13_asset",
    name: "Resource 13 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:15:23.347Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_14_asset: {
    _id: "resource_14_asset",
    name: "Resource 14 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:14:27.476Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_15_asset: {
    _id: "resource_15_asset",
    name: "Resource 15 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:18:52.780Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_16_asset: {
    _id: "resource_16_asset",
    name: "Resource 16 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:18:52.780Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
  resource_17_asset: {
    _id: "resource_17_asset",
    name: "Resource 17 asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/production-2024-05-28T23:21:00.530Z/edges-cropped.png",
      },
    ],
    dimensions: {
      dx: 1,
      dy: 1,
    },
  },
};
