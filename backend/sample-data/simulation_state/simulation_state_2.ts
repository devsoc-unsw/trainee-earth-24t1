import {
  AttributeJSON,
  CosmeticObjectJSON,
  HouseObjectJSON,
  ProductionObjectJSON,
  ResourceJSON,
  SimulationStateJSON,
  VillagerJSON,
} from "src/types/simulationTypes.ts";

const villager1: VillagerJSON = {
  _id: "villager_1",
  type: "farmer",
  friends: ["villager_2"],
  enemies: [],
  interactingWith: null,
  energy: 3000,
  coins: 24000,
  resources: {
    resource_1: 48,
    resource_2: 63,
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
    resource_1: 0.5,
    resource_2: 0.7,
  },
  houseObject: 
};

const villager2: VillagerJSON = {
  _id: "villager_2",
};

const attribute1: AttributeJSON = {
  _id: "attribute_1",
  name: "strength",
};

const attribute2: AttributeJSON = {
  _id: "attribute_2",
  name: "speed",
};

const houseObject1: HouseObjectJSON = {
  _id: "house_object_1",
};

const houseObject2: HouseObjectJSON = {
  _id: "house_object_2",
};

const productionObject1: ProductionObjectJSON = {
  _id: "production_object_1",
};

const productionObject2: ProductionObjectJSON = {
  _id: "production_object_2",
};

const cosmeticObject1: CosmeticObjectJSON = {
  _id: "cosmetic_object_1",
};

const cosmeticObject2: CosmeticObjectJSON = {
  _id: "cosmetic_object_2",
};

const resource1: ResourceJSON = {
  _id: "resource_1",
};

const resource2: ResourceJSON = {
  _id: "resource_2",
};

export const simulationServerState: SimulationStateJSON = {
  _id: "simulation_server_state",
  worldMap: { cells: [] },
  villagers: {
    villager_1: villager1,
    villager_2: villager2,
  },
  attributes: {
    attribute_1: attribute1,
    attribute_2: attribute2,
  },
  enviroObjects: {
    house_object_1: houseObject1,
    house_object_2: houseObject2,
    production_object_1: productionObject1,
    production_object_2: productionObject2,
    cosmetic_object_1: cosmeticObject1,
    cosmetic_object_2: cosmeticObject2,
  },
  resources: {
    resource_1: resource1,
    resource_2: resource2,
  },
};
