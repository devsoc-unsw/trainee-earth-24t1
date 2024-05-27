import { Asset, AssetId } from "asset-gen/generate-asset.ts";
import { UpdateFn } from "./gameloopFramework.js";
import {
  SimulationState,
  Villager,
  BuyInfo,
  SellInfo,
  ResourceId,
  VillagerId,
  EnviroObjectId,
  buyPref,
  villagerAssignType,
} from "src/types/simulationTypes.ts";
import { ResourceLimits } from "worker_threads";

const minProductionEnergy = 10;
const minItemsMade = 5;
const minPrice = 1;
const normalMinPrice = 5;
const sellMinPrice = 10;
const normalMaxPrice = 25;
const normalPriceRange = normalMaxPrice - normalMinPrice;
const maxPrice = 35;

export class SimulationServer {
  private state: SimulationState;
  private assets: Map<AssetId, Asset>;

  constructor(
    state: SimulationState = new SimulationState(),
    assets: Map<AssetId, Asset> = new Map()
  ) {
    this.state = state;
    this.assets = assets;
  }

  sendVillagerAssignment = (villager: VillagerId, resource: ResourceId) => {};

  simulationInit = () => {
    // assign workers to production plants randomly
    let villagersWorking = Math.ceil(this.state.villagers.size * 0.75);

    const resourcesRandom = getRandomUniqueNumbers(
      0,
      this.state.resources.size,
      villagersWorking,
      this.state
    );

    console.log(5, resourcesRandom);

    let workerList = Array.from(this.state.villagers.keys());
    console.log(1, workerList);

    const producedResources: ResourceId[] = [];
    let increment = villagersWorking / normalPriceRange;
    let i = 0;
    for (; i < villagersWorking; i++) {
      let worker = this.state.villagers.get(workerList[i]);
      console.log(2, worker);
      console.log(3, resourcesRandom);
      console.log(this.state.resources);
      let nItems = calcItemsMade(worker, resourcesRandom[i], this.state);

      worker.assignedPlant = true;
      let villagerAssignment: villagerAssignType = {
        resource: resourcesRandom[i],
        sellingPrice: Math.random() * (20 - 10) + 10,
        nItemsMade: nItems,
        energyCost:
          energyToProduce(villagersWorking / 2, i) * minProductionEnergy,
      };
      worker.assignment = villagerAssignment;
      producedResources.push(resourcesRandom[i]);
      worker.resources[resourcesRandom[i]].total = nItems;
      worker.resources[resourcesRandom[i]].isSelling = nItems / 2;
      let price = Math.floor(sellMinPrice + increment);
      worker.resources[resourcesRandom[i]].sellPrice = price;
      increment++;

      this.sendVillagerAssignment(worker._id, resourcesRandom[i]);
    }

    increment = villagersWorking / normalPriceRange;

    // generate a buy list based on above randomness, assigns to fields in the class
    i = 0;
    this.state.villagers.forEach((villager, villagerId) => {
      let resourcesList = getRandomUniqueNumbers(
        0,
        this.state.resources.size,
        villagersWorking,
        this.state
      );

      let price = Math.floor(normalMinPrice + increment);

      villager.resources[resourcesList[i]].buyPrice = price;
      if (
        i > villagersWorking + villagersWorking * 0.75 ||
        i < villagersWorking - villagersWorking * 0.75
      ) {
        villager.resources[resourcesList[i]].buyState = buyPref.wanted;
      } else {
        villager.resources[resourcesList[i]].buyState = buyPref.notWanted;
      }

      increment++;
      i++;
      this.state.show();
    });
  };

  /**
   * Servers as the update function to the gameloop framework.
   * Gets called by the gameloop framework at its specified framerate e.g. 20fps.
   */
  simulationStep: UpdateFn = (delta: number) => {
    console.log(`Step simulation forward one timestep`);
    this.state.show();

    const soldList = new Map<
      ResourceId,
      { totalPrice: number; totalQuantity: number }
    >();

    // console.log("1");

    if (Array.isArray(this.state.transactions)) {
      for (let i = 0; i < this.state.transactions.length; i++) {
        let transaction = this.state.transactions[i];
        soldList[transaction.resourceId].totalPrice += transaction.sellingPrice;
        soldList[transaction.resourceId].totalQuantity +=
          transaction.sellingQuantity;
      }
    }

    // console.log("2");

    const sortedSold: { resourceId: ResourceId; averagePrice: number }[] = [];

    for (const [resourceId, v] of Object.entries(soldList)) {
      let averagePrice = v.totalPrice / v.totalQuantity;
      sortedSold.push({ resourceId, averagePrice });
    }
    // console.log({ sortedSold });
    // console.log("3");

    sortedSold.sort((a, b) => b.averagePrice - a.averagePrice);

    this.state.transactions = [];

    let workingVillagers: Villager[] = [];

    // console.log("4");

    this.state.villagers.forEach((villager, villagerId) => {
      if (villager.energy >= minProductionEnergy) {
        villager.assignedPlant = false;
        workingVillagers.push(villager);
      }
    });

    // if sortedSold.length == 0, randomised assign, else { below:
    // but thered be way too much nesting tho so idk

    // console.log({ workingVillagers });

    const nBestSelling = sortedSold.length * 0.2;

    let workAtBest = workingVillagers.length * 0.3;

    const nWorkersAtBest: number[] = [];

    // console.log("5");

    for (let i = 0; i < sortedSold.length; i++) {
      if (i < nBestSelling % workAtBest) {
        nWorkersAtBest.push(1);
      } else {
        nWorkersAtBest.push(0);
      }
    }

    let workers = workAtBest - (nBestSelling % workAtBest);
    let i = 0;
    while (workers > 0) {
      for (let j = 0; j < nBestSelling - i; j++) {
        if (workers > 0) {
          nWorkersAtBest[j]++;
          workers--;
        }
        // console.log(workAtBest);
      }
      i++;
      if (i == nBestSelling) {
        i = 0;
      }
    }

    const medianSold = sortedSold.length / 2;

    interface ProductionAssigns {
      resourceId: ResourceId;
      nVillagers: number;
      energyCost: number;
      villagerList: { villager: Villager; itemsMade: number }[];
    }

    const workAssigns: ProductionAssigns[] = [];

    for (let i = 0; i < sortedSold.length; i++) {
      let energyCost = energyToProduce(medianSold, i) * minProductionEnergy;
      let villagerList: { villager: Villager; itemsMade: number }[] = [];
      this.state.villagers.forEach((villager, villagerId) => {
        if (villager.energy >= energyCost) {
          let items = calcItemsMade(
            villager,
            sortedSold[i].resourceId,
            this.state
          );
          villagerList.push({ villager: villager, itemsMade: items });
        }
      });

      villagerList.sort((a, b) => b.itemsMade - a.itemsMade);

      let nWorkers = 0;
      if (i < nWorkersAtBest.length) {
        nWorkers = nWorkersAtBest[i];
      } else {
        nWorkers =
          (workingVillagers.length - workAtBest) /
          (sortedSold.length - nBestSelling);
      }

      workAssigns.push({
        resourceId: sortedSold[i].resourceId,
        nVillagers: nWorkers,
        energyCost: energyCost,
        villagerList: villagerList,
      });
    }

    workers = workAtBest;
    while (workers != 0) {
      for (let i = 0; i < nBestSelling; i++) {
        let worker = workAssigns[i].villagerList[0];
        let nItems = 0;
        if (nWorkersAtBest[i] <= 0) {
          continue;
        }
        for (let j = 1; worker.villager.assignedPlant; j++) {
          worker = workAssigns[i].villagerList[j];
          nItems = worker.itemsMade;
        }
        let villagerAssignment = worker.villager.assignment;
        worker.villager.assignedPlant = true;
        nWorkersAtBest[i]--;
        villagerAssignment.resource = sortedSold[i].resourceId;
        villagerAssignment.sellingPrice = sortedSold[i].averagePrice;
        villagerAssignment.nItemsMade = nItems;
        villagerAssignment.energyCost = workAssigns[i].energyCost;
        this.sendVillagerAssignment(
          worker.villager._id,
          sortedSold[i].resourceId
        );
        // need to keep track of how many workers to assign to each plant
        // and stop when thats been reached
      }
    }

    workers = workingVillagers.length - workAtBest;

    const nPlants = sortedSold.length - nBestSelling;

    let atEachPlant = nPlants / workers;

    for (let i = 0; i < atEachPlant; i++) {
      for (let j = 0; workers > 0 && j < nPlants; j++) {
        let worker = workAssigns[i].villagerList[0];
        let nItems = 0;
        for (let k = 1; worker.villager.assignedPlant; k++) {
          worker = workAssigns[i].villagerList[k];
          nItems = worker.itemsMade;
        }
        let villagerAssignment = worker.villager.assignment;
        worker.villager.assignedPlant = true;
        nWorkersAtBest[i]--;
        villagerAssignment.resource = sortedSold[i].resourceId;
        villagerAssignment.sellingPrice = sortedSold[i].averagePrice;
        villagerAssignment.nItemsMade = nItems;
        villagerAssignment.energyCost = workAssigns[i].energyCost;
        this.sendVillagerAssignment(
          worker.villager._id,
          sortedSold[i].resourceId
        );
        // consider updating the villager main info here as well
      }
    }

    // energy used = min energy x rank
    // items made = min items x attributes
    // for every item, list villagers that have enough energy, sorted by most items produced
    // go through and match from beginning to end, when a villager is assigned, take them off the list for other items

    // calculation for how many per plant:
    // items = total * 0.2, villagers = villagers working * 0.3
    // diff = items % villagers
    // create an array of nItems, with villagers set to 0
    // for the diff, add 1 to each starting at 1st position, items -= diff
    // while items != 0, repeat above from 0 to (nVillagers - i)

    // do final checks such as if last plant is  = (remaining villagers/remaining plants), add 1 and minus 1 at 2nd (or wherever [i] >= [i + 1])
    // make sure its in descending order

    // should have a list of all the plants, ordered from most villagers ot least working there, with number of villagers each
    // number of items sold whenever trading last happened (20) x 20%, e.g. = 4 - iron, apples, wheat, silver
    // number of villagers who are going to work x 30% e.g. = 10, 10 is split into 4 but in descending order - 3, 3, 2, 2
    // how many villagers at this plant? - 4
    // pick 4 villagers to go here
    // based on how much energy it takes them (attributes + other stuff)
  };
}

// returns the energy multiplier it takes to work at that plant
function energyToProduce(medianSold: number, soldRank: number): number {
  let diff = medianSold - soldRank;
  let deviation = Math.abs(diff);
  deviation = (deviation / medianSold) * 0.5;

  if (soldRank >= medianSold) {
    return 1 + deviation;
  }

  return 1 - deviation;
}

function calcItemsMade(
  villager: Villager,
  resource: ResourceId,
  simState: SimulationState
): number {
  const attribtueAffinity = simState.resources.get(resource).attirbuteAffinity;

  let totalItems = minItemsMade;
  let totalAttribute = 0;
  for (let i = 0; i < attribtueAffinity.length; i++) {
    let attribute = attribtueAffinity[i];
    console.log(11, attribute);
    console.log(10, villager.characterAttributes[attribute]);
    totalAttribute += villager.characterAttributes[attribute].totalValue;
  }

  return totalItems + totalAttribute * 0.2;
}

function generateBuySellList(simState: SimulationState) {
  let buyList: BuyInfo[] = [];
  let sellList: SellInfo[] = [];

  simState.villagers.forEach((villager, villagerId) => {
    copyToBuyList(villager, buyList, simState);
    copyToSellList(villager, sellList, simState);
  });
}

function copyToBuyList(
  villager: Villager,
  list: BuyInfo[],
  simState: SimulationState
) {
  simState.resources.forEach((resource, resourceId) => {
    list.push({
      resourceId: resourceId,
      buyingPrice: villager.resources[resourceId].buyPrice,
      buyingState: villager.resources[resourceId].buyState,
      bought: false,
    });
  });
}

function copyToSellList(
  villager: Villager,
  list: SellInfo[],
  simState: SimulationState
) {
  simState.resources.forEach((resource, resourceId) => {
    list.push({
      resourceId: resourceId,
      sellingPrice: villager.resources[resourceId].sellPrice,
      sellingQuantity: villager.resources[resourceId].isSelling,
      sold: false,
    });
  });
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getRandomUniqueNumbers(
  min: number,
  max: number,
  count: number,
  simState: SimulationState
): ResourceId[] {
  if (count > max - min + 1) {
    throw new Error(
      "Cannot generate more unique numbers than the range allows."
    );
  }

  const range = Array.from(
    { length: max - min + 1 },
    (_, index) => index + min
  );
  const shuffledRange = shuffleArray(Array.from(simState.resources.keys()));
  console.log(6, shuffledRange.slice(0, count));
  return shuffledRange.slice(0, count);
}
