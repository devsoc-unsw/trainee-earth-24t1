import { AssetJSON } from "asset-gen/generate-asset.ts";
import {
  AttributeJSON,
  CosmeticObjectJSON,
  HouseObjectJSON,
  ProductionObjectJSON,
  ResourceJSON,
  SimulationStateJSON,
  VillagerJSON,
  WorldMapJSON,
  resourceOrigin,
} from "src/types/simulationTypes.ts";

const worldMap: WorldMapJSON = {
  cells: [
    {
      coordinates: {
        x: 0,
        y: 0,
      },
      owner: "villager_1",
      object: "house_object_1",
    },
    {
      coordinates: {
        x: 1,
        y: 0,
      },
      owner: "villager_1",
      object: "house_object_1",
    },
    // TODO: Fill in rest of the map, including cells occupied by the other
    // EnviroObject
  ],
};

const villager1: VillagerJSON = {
  _id: "villager_1",
  type: "farmer",
  friends: ["villager_2"],
  enemies: [],
  interactingWith: null,
  energy: 100,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  assignment: null,
};

const villager2: VillagerJSON = {
  _id: "villager_2",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 100,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  assignment: null,
};

const villager3: VillagerJSON = {
  _id: "villager_3",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 100,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  assignment: null,
};

const villager4: VillagerJSON = {
  _id: "villager_4",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 100,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  assignment: null,
};

const villager5: VillagerJSON = {
  _id: "villager_5",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 100,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  assignment: null,
};

const villager6: VillagerJSON = {
  _id: "villager_6",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 100,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  assignment: null,
};

const villager7: VillagerJSON = {
  _id: "villager_7",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 100,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  assignment: null,
};

const villager8: VillagerJSON = {
  _id: "villager_8",
  type: "miner",
  friends: ["villager_1"],
  enemies: [],
  interactingWith: null,
  energy: 100,
  coins: 90,
  resources: {},
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {},
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  assignment: null,
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

const houseObject1: HouseObjectJSON = {
  _id: "house_object_1",
  name: "Villager 1's house",
  asset: "house_object_1_asset",
  owner: "villager_1",
};

const productionObject1: ProductionObjectJSON = {
  _id: "production_object_1",
  name: "Wheat Farm",
  asset: "production_object_1_asset",
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

const cosmeticObject1: CosmeticObjectJSON = {
  _id: "cosmetic_object_1",
  name: "Fountain of Youth",
  asset: "cosmetic_object_1_asset",
};

const resource1: ResourceJSON = {
  _id: "resource_1",
  name: "Wheat",
  productionEnergyCostBasic: 10,
  consumptionEnergyGainBasic: 10,
  type: "edible",
  attirbuteAffinity: ["Speed", "Dexterity", "Perception"],
  productionObject: "production_object_1",
};

const resource2: ResourceJSON = {
  _id: "resource_2",
  name: "Corn",
  productionEnergyCostBasic: 10,
  consumptionEnergyGainBasic: 10,
  type: "edible",
  attirbuteAffinity: ["Speed", "Charisma", "Stamina"],
  productionObject: "production_object_1",
};

const resource3: ResourceJSON = {
  _id: "resource_3",
  name: "Carrots",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "edible",
  attirbuteAffinity: ["Speed", "Strength", "Negotiation"],
  productionObject: "production_object_1",
};

const resource4: ResourceJSON = {
  _id: "resource_4",
  name: "Apples",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "edible",
  attirbuteAffinity: ["Speed", "Intelligence", "Dexterity"],
  productionObject: "production_object_1",
};

const resource5: ResourceJSON = {
  _id: "resource_5",
  name: "Pork",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "edible",
  attirbuteAffinity: ["Speed", "Negotiation", "Luck"],
  productionObject: "production_object_1",
};

const resource6: ResourceJSON = {
  _id: "resource_6",
  name: "Iron",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "building material",
  attirbuteAffinity: ["Stamina", "Strength", "Perception"],
  productionObject: "production_object_1",
};

const resource7: ResourceJSON = {
  _id: "resource_7",
  name: "Gold",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "building material",
  attirbuteAffinity: ["Strength", "Charisma", "Luck"],
  productionObject: "production_object_1",
};

const resource8: ResourceJSON = {
  _id: "resource_8",
  name: "Silver",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "building material",
  attirbuteAffinity: ["Strength", "Luck", "Dexterity"],
  productionObject: "production_object_1",
};

const resource9: ResourceJSON = {
  _id: "Coal",
  name: "Flour",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "building material",
  attirbuteAffinity: ["Strength", "Speed", "Intelligence"],
  productionObject: "production_object_1",
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
    house_object_1: houseObject1,
    production_object_1: productionObject1,
    cosmetic_object_1: cosmeticObject1,
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
  },
};

export const assets1: AssetJSON[] = [
  {
    id: "house_object_1_asset",
    name: "Villager 1 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description:
      "A cute aesthetic standard isometric aerial view of a single large square villager's house. The villager's house is a charming fusion of medieval European timber-framed architecture and Japanese machiya townhouses. Its warm, honey-colored wooden beams crisscross over pristine white plaster walls, creating a tapestry of old-world charm. The steeply pitched roof is adorned with gently curving eaves, reminiscent of traditional Japanese craftsmanship, sheltering latticed windows that let golden sunlight spill into the cozy interiors..........",
    type: "png",
    remoteImages: [
      {
        name: "original.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/original.png",
      },
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/edges-cropped.png",
      },
    ],
    dimensions: {
      width: 40,
      height: 40,
    },
  },
  {
    id: "production_object_1_asset",
    name: "Wheat Farm asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "original.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/original.png", // Note: still image of house, replace with wheat farm image
      },
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/edges-cropped.png", // Note: still image of house, replace with wheat farm image
      },
    ],
    dimensions: {
      width: 36,
      height: 36,
    },
  },
  {
    id: "cosmetic_object_1_asset",
    name: "Fountain of Youth asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "..........",
    type: "png",
    remoteImages: [
      {
        name: "original.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/original.png", // Note: still image of house, replace with fountain image
      },
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/edges-cropped.png", // Note: still image of house, replace with fountain image
      },
    ],
    dimensions: {
      width: 10,
      height: 10,
    },
  },
];
