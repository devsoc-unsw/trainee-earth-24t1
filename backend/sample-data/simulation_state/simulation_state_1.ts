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

const worldMap: WorldMapJSON = {
  cells: {
    "0,0": {
      coordinates: {
        x: 0,
        y: 0,
      },
      owner: "villager_1",
      object: "house_object_1",
    },
    "1,0": {
      coordinates: {
        x: 1,
        y: 0,
      },
      owner: "villager_1",
      object: "house_object_1",
    },
    // TODO: Fill in rest of the map, including cells occupied by the other
    // EnviroObject
  },
};

const villager1: VillagerJSON = {
  _id: "villager_1",
  type: "farmer",
  friends: ["villager_2"],
  enemies: [],
  interactingWith: null,
  energy: 3000,
  coins: 24000,
  resources: {
    resource_1: { total: 48, isSelling: 23, buyPrice: 8 },
    resource_2: { total: 57, isSelling: 36, buyPrice: 5 },
  },
  cosmeticEnvironmentObjects: ["cosmetic_object_1"], // villager1 owns this cosmetic object and is entitled to place it wherever they want within their plot of land
  characterAttributes: {
    attribute_1: {
      _id: "attribute_value_1",
      base: 10,
      boosts: [],
    },
    attribute_2: {
      _id: "attribute_value_2",
      base: 5,
      boosts: [
        {
          value: 2,
          duration: 3600,
          expiration: Date.now() + 3600,
        },
        {
          value: 3,
          duration: 7200,
          expiration: Date.now() + 7200,
        },
      ],
    },
  },
  resourceProductionEnergyCostMultipliers: {
    resource_1: 1.3,
    resource_2: 0.9,
  },
  resourceConsumptionEnergyGainMultipliers: {
    resource_1: 1.5,
    resource_2: 0.8,
  },
  houseObject: "house_object_1",
  asset: "villager_1_asset",
  position: {
    x: 0,
    y: 5,
  },
};

const attribute1: AttributeJSON = {
  _id: "attribute_1",
  name: "Strength",
};

const attribute2: AttributeJSON = {
  _id: "attribute_2",
  name: "Speed",
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
};

const resource2: ResourceJSON = {
  _id: "resource_2",
  name: "Flour",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "edible",
};

export const simulationState1: SimulationStateJSON = {
  _id: "simulation_server_state",
  worldMap: worldMap,
  villagers: {
    villager_1: villager1,
  },
  attributes: {
    attribute_1: attribute1,
    attribute_2: attribute2,
  },
  enviroObjects: {
    house_object_1: houseObject1,
    production_object_1: productionObject1,
    cosmetic_object_1: cosmeticObject1,
  },
  resources: {
    resource_1: resource1,
    resource_2: resource2,
  },
};

export const assets1: AssetsJSON = {
  house_object_1_asset: {
    _id: "house_object_1_asset",
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
      dx: 40,
      dy: 40,
    },
  },
  production_object_1_asset: {
    _id: "production_object_1_asset",
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
      dx: 36,
      dy: 36,
    },
  },
  cosmetic_object_1_asset: {
    _id: "cosmetic_object_1_asset",
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
      dx: 10,
      dy: 10,
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
};
