import { AssetJSON } from "@backend/types/assetTypes.ts";
import { WorldMapJSON } from "@backend/types/simulationTypes.ts";
import { cells } from "./map_vis_cells_1.ts";

export const worldMap: WorldMapJSON = {
  cells: {
    ...cells,
    "0,0": {
      owner: "villager_1",
      object: "house_object_6_asset",
    },
    "18,4": {
      owner: "villager_2",
      object: "house_object_2_asset",
    },
    "0,15": {
      owner: "villager_3",
      object: "house_object_3_asset",
    },
    "-15,0": {
      owner: "villager_4",
      object: "house_object_4_asset",
    },
    "0,-15": {
      owner: "villager_5",
      object: "house_object_5_asset",
    },
    "6,6": {
      owner: null,
      object: "cosmetic_object_2_asset",
    },
    "-12,12": {
      owner: null,
      object: "cosmetic_object_3_asset",
    },
    "-16,-10": {
      owner: null,
      object: "cosmetic_object_4_asset",
    },
    "-10,-18": {
      owner: null,
      object: "cosmetic_object_5_asset",
    },
    "-18,-18": {
      owner: null,
      object: "production_object_1_asset",
    },
    "-18,18": {
      owner: null,
      object: "production_object_2_asset",
    },
    "18,-18": {
      owner: null,
      object: "production_object_3_asset",
    },
    "13,18": {
      owner: null,
      object: "production_object_4_asset",
    },
    "13,-10": {
      owner: null,
      object: "production_object_5_asset",
    },
  },
};

const villager1 = {
  _id: "villager_1",
  type: "farmer",
  friends: ["villager_2"],
  enemies: [],
  interactingWith: null,
  energy: 3000,
  coins: 24000,
  resources: {
    resource_1: {
      total: 48,
      isSelling: 12,
      sellingPrice: 6, // $8 per unit
      buyPrice: 7, // $7 per unit
    },
    resource_2: {
      total: 64,
      isSelling: 12,
      sellingPrice: 6, // $8 per unit
      buyPrice: 2, // $7 per unit
    },
    resource_3: {
      total: 64,
      isSelling: 12,
      sellingPrice: 6, // $8 per unit
      buyPrice: 3, // $7 per unit
    },
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
};

const attribute1 = {
  _id: "attribute_1",
  name: "Strength",
};

const attribute2 = {
  _id: "attribute_2",
  name: "Speed",
};

const houseObject1 = {
  _id: "house_object_1",
  name: "Villager 1's house",
  asset: "house_object_1_asset",
  owner: "villager_1",
};

const productionObject1 = {
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

const cosmeticObject1 = {
  _id: "cosmetic_object_1",
  name: "Fountain of Youth",
  asset: "cosmetic_object_1_asset",
};

const resource1 = {
  _id: "resource_1",
  name: "Wheat",
  productionEnergyCostBasic: 10,
  consumptionEnergyGainBasic: 10,
  type: "edible",
};

const resource2 = {
  _id: "resource_2",
  name: "Flour",
  productionEnergyCostBasic: 15,
  consumptionEnergyGainBasic: 13,
  type: "edible",
};

export const simulationState1 = {
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

export const assets: AssetJSON[] = [
  {
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
        url: "https://flatearth.b-cdn.net/house-2024-05-18T14:15:16.436Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      width: 8,
      height: 8,
    },
  },
  {
    _id: "house_object_2_asset",
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
      width: 8,
      height: 8,
    },
  },
  {
    _id: "house_object_3_asset",
    name: "Villager 8 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "...",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-23T03:24:30.024Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      width: 8,
      height: 8,
    },
  },
  {
    _id: "house_object_4_asset",
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
      width: 8,
      height: 8,
    },
  },
  {
    _id: "house_object_5_asset",
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
      width: 8,
      height: 8,
    },
  },
  {
    _id: "house_object_6_asset",
    name: "Villager 6 House asset",
    date: "2024-05-21T18:23:42.555+10:00",
    description: "...",
    type: "png",
    remoteImages: [
      {
        name: "final.png",
        url: "https://flatearth.b-cdn.net/house-2024-05-23T03:30:14.011Z/edges-cropped2.png",
      },
    ],
    dimensions: {
      width: 8,
      height: 8,
    },
  },
  {
    _id: "production_object_1_asset",
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
      width: 9,
      height: 9,
    },
  },
  {
    _id: "production_object_2_asset",
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
      width: 7,
      height: 7,
    },
  },
  {
    _id: "production_object_3_asset",
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
      width: 8,
      height: 8,
    },
  },
  {
    _id: "production_object_4_asset",
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
      width: 8,
      height: 8,
    },
  },
  {
    _id: "production_object_5_asset",
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
      width: 8,
      height: 8,
    },
  },
  {
    _id: "cosmetic_object_1_asset",
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
      width: 3,
      height: 3,
    },
  },
  {
    _id: "cosmetic_object_2_asset",
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
      width: 3,
      height: 3,
    },
  },
  {
    _id: "cosmetic_object_3_asset",
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
      width: 2,
      height: 2,
    },
  },
  {
    _id: "cosmetic_object_4_asset",
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
      width: 2,
      height: 2,
    },
  },
  {
    _id: "cosmetic_object_5_asset",
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
      width: 4,
      height: 4,
    },
  },
];
