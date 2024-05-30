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
  TradeInfo,
  TransactionsType,
  resourceOrigin,
  AttributeValue,
  Resource,
} from "src/types/simulationTypes.ts";
import { ResourceLimits } from "worker_threads";

import fs from "fs";

const minProductionEnergy = 10;
const maxAttribute = 15;
const maxProductionEnergy = minProductionEnergy + maxAttribute * 3 * 0.2;
const minConsumeEnergy = 5;
const minItemsMade = 5;
const minPrice = 1;
const normalMinPrice = 5;
const sellMinPrice = 10;
const normalMaxPrice = 25;
const normalPriceRange = normalMaxPrice - normalMinPrice;
const maxPrice = 35;
const buyQuantity = 3;

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

  sendVillagerAssignment = (
    state: SimulationState,
    villager: VillagerId,
    resource: ResourceId
  ) => {};
  sendVillagerConsumeEvent = (
    state: SimulationState,
    villager: VillagerId,
    resources: { [key: ResourceId]: number }
  ) => {};

  sendTradeEvent = (
    state: SimulationState,
    villagerBuying: VillagerId,
    villagerSelling: VillagerId,
    resource: ResourceId,
    price: number
  ) => {};

  simulationInit = () => {
    this.state.villagers.forEach((villager, villagerId) => {
      this.state.resources.forEach((resource, resourceId) => {
        villager.resources[resourceId] = {
          total: 0,
          isSelling: 0,
          sellPrice: 0,
          buyPrice: 0,
          buyState: buyPref.notWanted,
          origin: resourceOrigin.bought,
        };
      });

      this.state.attributes.forEach((attribute, attributeId) => {
        //come up with attribute
        let baseValue = Math.ceil(Math.random() * (maxAttribute - 0));
        if (attributeId == "Speed" || attributeId == "Strength") {
          baseValue = Math.ceil(Math.random() * (maxAttribute - 7) + 7);
        }
        const instance = new AttributeValue(baseValue);

        villager.characterAttributes[attributeId] = instance;
      });
    });
    // assign workers to production plants randomly
    let villagersWorking = Math.ceil(this.state.villagers.size * 0.75);
    //console.log(villagersWorking);

    const resourcesRandom = getRandomUniqueNumbers(
      0,
      this.state.resources.size,
      villagersWorking,
      this.state
    );

    //console.log(5, resourcesRandom);

    let workerList = Array.from(this.state.villagers.keys());
    //console.log(1, workerList);

    const producedResources: ResourceId[] = [];
    let increment = villagersWorking / normalPriceRange;
    let i = 0;
    for (; i < villagersWorking; i++) {
      let worker = this.state.villagers.get(workerList[i]);
      //console.log(2, worker);
      //console.log(3, resourcesRandom);
      //console.log(this.state.resources);
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

      this.sendVillagerAssignment(this.state, worker._id, resourcesRandom[i]);
    }

    // generate a buy list based on above randomness, assigns to fields in the class
    i = 0;
    this.state.villagers.forEach((villager, villagerId) => {
      let resourcesList = getRandomUniqueNumbers(
        0,
        this.state.resources.size,
        this.state.resources.size,
        this.state
      );

      //console.log("resources", resourcesList);
      i = 0;
      increment = this.state.villagers.size / normalPriceRange;
      this.state.resources.forEach((resource, resourceId) => {
        let price = Math.floor(normalMinPrice + 5 + increment);

        villager.resources[resourcesList[i]].buyPrice = price;
        if (
          i > this.state.resources.size + this.state.resources.size * 0.75 ||
          i < this.state.resources.size - this.state.resources.size * 0.75
        ) {
          villager.resources[resourcesList[i]].buyState = buyPref.wanted;
        } else {
          villager.resources[resourcesList[i]].buyState = buyPref.notWanted;
        }

        increment++;
        i++;
      });
    });

    console.log("initalise");
    // this.state.villagers.forEach((villager, villagerId) => {
    //   console.log(villager._id, villager.energy);
    //   if (villager.assignment === null) {
    //     console.log("assignment: null");
    //   } else {
    //     console.log(villager.assignment);
    //   }
    // });
    //const fs = require("fs");
    fs.appendFileSync(
      "output_test2.json",
      "Step simulation forward one timestep, production\n"
    );
    this.state.villagers.forEach((villagers, villagerId) => {
      let print: string = ``;
      if (villagers.assignment === null) {
        print = `"${villagerId}, energy: ${villagers.energy}, coins: ${villagers.coins}, assigned: null\n`;
      } else {
        print = `"${villagerId}, energy: ${villagers.energy}, coins: ${villagers.coins}, assigned: ${villagers.assignment.resource}\n`;
      }
      fs.appendFileSync("output_test2.json", print);
      this.state.resources.forEach((reousrce, resourceId) => {
        const resourceDetails = villagers.resources[resourceId];

        const printRes: string = `${resourceId}, total: ${resourceDetails.total}, buyPrice: ${resourceDetails.buyPrice}, isSelling: ${resourceDetails.isSelling}, sellPrice: ${resourceDetails.sellPrice}\n`;
        fs.appendFileSync("output_test2.json", printRes);
      });
    });
    //console.dir(this.state.villagers, { depth: null });
    // this.state.show();
  };

  /**
   * Servers as the update function to the gameloop framework.
   * Gets called by the gameloop framework at its specified framerate e.g. 20fps.
   */
  simulationStep: UpdateFn = (delta: number, counter: number) => {
    console.log(`Step simulation forward one timestep`);
    const jsonData = this.state.serialize();

    // const fs = require("fs");

    // this.state.show();
    //  console.dir(this.state.villagers, { depth: null });

    /**
     * making trades
     */
    if (counter % 10 === 0) {
      fs.appendFileSync(
        "output_test2.json",
        "Step simulation forward one timestep, production\n"
      );
      this.state.villagers.forEach((villagers, villagerId) => {
        let print: string = ``;
        if (villagers.assignment === null) {
          print = `"${villagerId}, energy: ${villagers.energy}, coins: ${villagers.coins}, assigned: null\n`;
        } else {
          print = `"${villagerId}, energy: ${villagers.energy}, coins: ${villagers.coins}, assigned: ${villagers.assignment.resource}\n`;
        }
        fs.appendFileSync("output_test2.json", print);
        this.state.resources.forEach((reousrce, resourceId) => {
          const resourceDetails = villagers.resources[resourceId];

          const printRes: string = `${resourceId}, total: ${resourceDetails.total}, buyPrice: ${resourceDetails.buyPrice}, isSelling: ${resourceDetails.isSelling}, sellPrice: ${resourceDetails.sellPrice}\n`;
          fs.appendFileSync("output_test2.json", printRes);
        });
      });
      this.state.transactions = [];

      let buyList: BuyInfo[] = [];
      let sellList: SellInfo[] = [];

      generateBuySellList(this.state, buyList, sellList);

      //console.log(3, buyList);

      buyList.sort(compareResourceBuy);
      sellList.sort(compareResourceSell);

      let j = 0;
      for (let j = 0; j < sellList.length; j++) {
        if (sellList[j].sellingQuantity - buyQuantity < 0) {
          //console.log(15, sell.sellingQuantity - buyQuantity);
          let villager = this.state.villagers.get(sellList[j].villagerId);
          if (villager.resources[sellList[j].resourceId].sellPrice > 1) {
            villager.resources[sellList[j].resourceId].sellPrice--;
          }
          sellList.splice(j, 1);
          j--;
        }
      }
      // console.log(sellList);
      let indexStart = 0;

      const transactionList: TransactionsType = [];
      //console.log(sellList);
      // console.log(4, buyList, buyList[0]);

      j = 0;
      while (
        sellList.length > 0 &&
        buyList[j].buyingPrice < sellList[0].sellingPrice
      ) {
        j++;
        if (j >= buyList.length) {
          break;
        }
        //console.log(j);
      }
      indexStart = j;
      j = 0;
      for (let i = indexStart; i < buyList.length && j < sellList.length; i++) {
        //console.log(j);
        while (buyList[i].resourceId > sellList[j].resourceId) {
          j++;
          //console.log(1, j);
          if (j >= sellList.length) {
            break;
          }
        }
        if (
          j < sellList.length &&
          buyList[i].resourceId == sellList[j].resourceId &&
          buyList[i].buyingPrice >= sellList[j].sellingPrice &&
          buyList[i].villagerId != sellList[j].villagerId &&
          this.state.villagers.get(buyList[i].villagerId).coins >
            sellList[j].sellingPrice
        ) {
          let transactionInfo: TradeInfo = {
            resourceId: sellList[j].resourceId,
            salePrice: sellList[j].sellingPrice,
            saleQuantity: buyQuantity,
            villagerSell: sellList[j].villagerId,
            villagerBuy: buyList[i].villagerId,
          };
          updateVillagersBuySell(this.state, transactionInfo);
          transactionList.push(transactionInfo);
          this.sendTradeEvent(
            this.state,
            buyList[i].villagerId,
            sellList[j].villagerId,
            sellList[j].resourceId,
            sellList[j].sellingPrice
          );
          j++;
        } else {
          buyList[i].bought = false;
        }
      }

      this.state.transactions = transactionList;
      //console.log(this.state.transactions);
      // let max = 0;
      // let max_resource: ResourceId = "s";
      this.state.villagers.forEach((villager, villagerId) => {
        this.state.resources.forEach((resource, resourceId) => {
          // if (max < villager.resources[resourceId].buyPrice) {
          //   max = villager.resources[resourceId].buyPrice;
          // }
          villager.resources[resourceId].buyPrice++;
          if (villager.resources[resourceId].buyPrice >= 35) {
            villager.resources[resourceId].buyPrice = 1;
          }
        });
        // console.log(villagerId, villager.resources);
        // villager.resources[max_resource].buyPrice = 1;
      });

      /**
       * end of makikng trades
       */
    }

    /**
     * Production assignment
     */

    if ((counter + 5) % 10 === 0) {
      fs.appendFileSync(
        "output_test2.json",
        "Step simulation forward one timestep, production\n"
      );
      this.state.villagers.forEach((villagers, villagerId) => {
        let print: string = ``;
        if (villagers.assignment === null) {
          print = `"${villagerId}, energy: ${villagers.energy}, coins: ${villagers.coins}, assigned: null \n`;
        } else {
          print = `"${villagerId}, energy: ${villagers.energy}, coins: ${villagers.coins}, assigned: ${villagers.assignment.resource} items made: ${villagers.assignment.nItemsMade}\n`;
        }

        fs.appendFileSync("output_test2.json", print);
        this.state.resources.forEach((reousrce, resourceId) => {
          const resourceDetails = villagers.resources[resourceId];

          const printRes: string = `${resourceId}, total: ${resourceDetails.total}\n`;
          fs.appendFileSync("output_test2.json", printRes);
        });
      });
      // print stuff out in a readable way

      this.state.villagers.forEach((villager, villagerId) => {
        villager.assignment = null;
      });

      const soldList = new Map<
        ResourceId,
        { totalPrice: number; totalQuantity: number }
      >();

      // //console.log("1");
      //console.log("transactions:", this.state.transactions);
      if (Array.isArray(this.state.transactions)) {
        for (let i = 0; i < this.state.transactions.length; i++) {
          //console.log(i);
          let transaction = this.state.transactions[i];

          soldList.set(transaction.resourceId, {
            totalPrice: transaction.salePrice,
            totalQuantity: transaction.saleQuantity,
          });
          //.totalPrice +=
          // transaction.salePrice;
          //soldList.set(transaction.resourceId).totalQuantity +=
          //  transaction.saleQuantity;
        }
      }
      //console.log(soldList);
      // //console.log("2");

      const sortedSold: { resourceId: ResourceId; averagePrice: number }[] = [];
      //console.log(2, soldList);

      soldList.forEach((resource, resourceId) => {
        //console.log(10);
        let averagePrice = resource.totalPrice / resource.totalQuantity;
        sortedSold.push({ resourceId, averagePrice });
      });

      // for (const [resourceId, v] of soldList.entries()) {
      //   //console.log(10);
      //   let averagePrice = v.totalPrice / v.totalQuantity;

      //   sortedSold.push({ resourceId, averagePrice });
      // }
      // console.log({ sortedSold });
      // //console.log("3");
      //console.log(3);
      sortedSold.sort((a, b) => b.averagePrice - a.averagePrice);

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

      // //console.log({ workingVillagers });

      const nBestSelling = Math.ceil(sortedSold.length * 0.2);
      //console.log(sortedSold.length);

      let workAtBest = workingVillagers.length * 0.3;

      const nWorkersAtBest: number[] = [];

      //console.log("5");

      for (let i = 0; i < sortedSold.length; i++) {
        if (i < nBestSelling % workAtBest) {
          nWorkersAtBest.push(1);
        } else {
          nWorkersAtBest.push(0);
        }
      }

      let workers = Math.ceil(workAtBest - (nBestSelling % workAtBest));
      let i = 0;
      //console.log(nBestSelling);
      while (workers > 0) {
        for (let j = 0; j < nBestSelling - i; j++) {
          if (workers > 0) {
            nWorkersAtBest[j]++;
            workers--;
          }
          // //console.log(workAtBest);
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
      // add villagers that dont have enough energy to work to a different list
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

      workers = Math.floor(workAtBest);
      // console.log("best", nBestSelling, workAtBest);
      //console.log(10, Math.floor(nBestSelling));
      while (workers != 0) {
        //console.log(workers);
        for (let i = 0; i < Math.floor(nBestSelling); i++) {
          let worker = workAssigns[i].villagerList[0];
          let nItems = 0;

          if (nWorkersAtBest[i] <= 0) {
            i++;

            continue;
          }
          for (let j = 1; worker.villager.assignment != null; j++) {
            // if k is larger than villagerList.length??
            worker = workAssigns[i].villagerList[j];
            nItems = worker.itemsMade;
          }
          //let villagerAssignment = worker.villager.assignment;
          worker.villager.assignedPlant = true;
          let villagerAssignment: villagerAssignType = {
            resource: sortedSold[i].resourceId,
            sellingPrice: sortedSold[i].averagePrice,
            nItemsMade: nItems,
            energyCost: workAssigns[i].energyCost,
          };
          worker.villager.assignment = villagerAssignment;
          nWorkersAtBest[i]--;
          workers--;

          worker.villager.resources[sortedSold[i].resourceId].total += nItems;
          worker.villager.resources[sortedSold[i].resourceId].isSelling +=
            nItems / 2;
          worker.villager.energy -= workAssigns[i].energyCost;
          worker.villager.resources[sortedSold[i].resourceId].sellPrice =
            sortedSold[i].averagePrice;
          //console.log(1, sortedSold[i].averagePrice);

          this.sendVillagerAssignment(
            this.state,
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
      // yet to implement this but should almost naturally be implemented

      for (let i = 0; i < atEachPlant; i++) {
        for (let j = 0; workers > 0 && j < nPlants; j++) {
          let worker = workAssigns[i].villagerList[0];
          //console.log(worker);
          let nItems = 0;
          for (let k = 1; worker.villager.assignment != null; k++) {
            // if k is larger than villagerList.length??
            worker = workAssigns[i].villagerList[k];
            nItems = worker.itemsMade;
          }
          let villagerAssignment: villagerAssignType = {
            resource: sortedSold[i].resourceId,
            sellingPrice: sortedSold[i].averagePrice,
            nItemsMade: nItems,
            energyCost: workAssigns[i].energyCost,
          };
          worker.villager.assignment = villagerAssignment;
          workers--;

          worker.villager.resources[sortedSold[i].resourceId].total += nItems;
          worker.villager.resources[sortedSold[i].resourceId].isSelling +=
            nItems / 2;
          worker.villager.energy -= workAssigns[i].energyCost;
          worker.villager.resources[sortedSold[i].resourceId].sellPrice =
            sortedSold[i].averagePrice;

          this.sendVillagerAssignment(
            this.state,
            worker.villager._id,
            sortedSold[i].resourceId
          );
          //console.log(1, sortedSold[i].averagePrice);
        }
      }

      // checks how many resources haven't been assigned to produce, and if its lower than a certain amount, we assign
      // some extra randomly, the same way completed at the beginning of the code
      let nullAssignments = 0;
      let workerList: Villager[] = [];
      let needToConsume: Villager[] = [];
      this.state.villagers.forEach((villager, villagerId) => {
        if (villager.assignment == null) {
          if (villager.energy >= maxProductionEnergy) {
            nullAssignments++;
            workerList.push(villager);
          } else {
            needToConsume.push(villager);
          }
        } else if (villager.energy < maxProductionEnergy) {
          needToConsume.push(villager);
        }
      });

      let villagersWorking = Math.ceil(nullAssignments * 0.75);

      const resourcesRandom = getRandomUniqueNumbers(
        0,
        this.state.resources.size,
        this.state.resources.size,
        this.state
      );

      let j = 0;
      for (const resource of resourcesRandom) {
        const foundElement = sortedSold.find(
          (sortedSold) => sortedSold.resourceId === resource
        );
        if (foundElement !== undefined) {
          resourcesRandom.splice(j, 1);
        } else {
          j++;
        }
      }
      // vilagers working should be from the list above on line 372
      if (nullAssignments < this.state.resources.size * 0.6) {
        let increment = villagersWorking / normalPriceRange;
        let i = 0;
        for (; i < villagersWorking * 0.7; i++) {
          let worker = this.state.villagers.get(workerList[i]._id);
          //console.log(2, worker);
          //console.log(3, resourcesRandom);
          //console.log(this.state.resources);

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
          //producedResources.push(resourcesRandom[i]);
          worker.resources[resourcesRandom[i]].total = nItems;
          worker.resources[resourcesRandom[i]].isSelling = nItems / 2;
          let price = Math.floor(sellMinPrice + increment);

          worker.resources[resourcesRandom[i]].sellPrice = price;
          increment++;

          this.sendVillagerAssignment(
            this.state,
            worker._id,
            resourcesRandom[i]
          );
        }
      }
      /**
       * end of production assignment
       */

      /**
       * start of consumption assignment
       */
      for (const worker of needToConsume) {
        let resourcesAvailable: { resource: ResourceId; energy: number }[] = [];
        const consumedResources: { [key: ResourceId]: number } = {};
        this.state.resources.forEach((reousrce, resourceId) => {
          if (worker.resources[resourceId].total > 1) {
            resourcesAvailable.push({
              resource: resourceId,
              energy: calcConsumeEnergy(this.state, worker, resourceId),
            });
          }
        });

        //  console.log(resourcesAvailable);

        resourcesAvailable.sort((a, b) => b.energy - a.energy);

        let itemsConsumed = 3;

        for (let i = 0; itemsConsumed > 0; i++) {
          //  console.log(i);
          const id = resourcesAvailable[i].resource;
          if (resourcesAvailable.length < 3) {
            while (worker.resources[id].total > 0 && itemsConsumed > 0) {
              consumeResource(
                worker,
                id,
                resourcesAvailable,
                i,
                consumedResources
              );
              console.log(
                worker._id,
                worker.energy,
                worker.resources[id].total,
                "i: ",
                i
              );
              itemsConsumed--;
            }
          } else {
            consumeResource(
              worker,
              id,
              resourcesAvailable,
              i,
              consumedResources
            );
            itemsConsumed--;
          }
        }
        this.sendVillagerConsumeEvent(
          this.state,
          worker._id,
          consumedResources
        );
      }

      this.state.villagers.forEach((villager, villagerId) => {
        console.log(villager._id, "\n", villager.energy);
        //console.log(villager.resources);
        //   if (villager.assignment === null) {
        //     console.log("assignment: null");
        //   } else {
        //     console.log(
        //       villager.assignment.resource,
        //       ":",
        //       villager.assignment.nItemsMade
        //     );
        //   }
        //   console.log("\n");
      });

      /**
       * end of consumption assignment
       */
    }
  };
}

function consumeResource(
  worker: Villager,
  id: ResourceId,
  resourcesAvailable: { resource: ResourceId; energy: number }[],
  i: number,
  consumedResources: { [key: ResourceId]: number }
) {
  worker.resources[id].total--;
  if (worker.resources[id].isSelling < worker.resources[id].total) {
    worker.resources[id].isSelling--;
  }
  worker.energy += resourcesAvailable[i].energy;

  if (consumedResources.hasOwnProperty(id)) {
    consumedResources[id]++;
  } else {
    consumedResources[id] = 1;
  }
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
    const characterAttributes = villager.characterAttributes;
    if (attribute in villager.characterAttributes) {
      totalAttribute += villager.characterAttributes[attribute].totalValue;
    }
  }

  return totalItems + totalAttribute * 0.2;
}

function generateBuySellList(
  simState: SimulationState,
  buyList: BuyInfo[],
  sellList: SellInfo[]
) {
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
      villagerId: villager._id,
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
      villagerId: villager._id,
      resourceId: resourceId,
      sellingPrice: villager.resources[resourceId].sellPrice,
      sellingQuantity: villager.resources[resourceId].isSelling,
      sold: false,
    });
    //console.log(100, villager.resources[resourceId].isSelling);
  });
}

function updateVillagersBuySell(
  simState: SimulationState,
  transactionInfo: TradeInfo
) {
  const villagerBuy = simState.villagers.get(transactionInfo.villagerBuy);
  const villagerSell = simState.villagers.get(transactionInfo.villagerSell);

  villagerBuy.resources[transactionInfo.resourceId].total +=
    transactionInfo.saleQuantity;
  villagerSell.resources[transactionInfo.resourceId].total -=
    transactionInfo.saleQuantity;

  villagerBuy.coins -= transactionInfo.salePrice;
  villagerSell.coins += transactionInfo.salePrice;

  villagerSell.resources[transactionInfo.resourceId].isSelling -=
    transactionInfo.saleQuantity;
  //   console.log(
  //     villagerSell.resources[transactionInfo.resourceId].isSelling,
  //     transactionInfo.saleQuantity
  //   );
  villagerBuy.resources[transactionInfo.resourceId].isSelling +=
    transactionInfo.saleQuantity / 2;

  villagerSell.resources[transactionInfo.resourceId].sellPrice++;
  villagerBuy.resources[transactionInfo.resourceId].buyPrice = normalMinPrice;
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
  ////console.log(6, shuffledRange.slice(0, count));
  return shuffledRange.slice(0, count);
}

function compareResourceSell(a: SellInfo, b: SellInfo): number {
  // Compare by last name
  if (a.resourceId !== b.resourceId) {
    return a.resourceId.localeCompare(b.resourceId);
  }
  // If last names are equal, compare by first name
  return a.sellingPrice - b.sellingPrice;
}

function compareResourceBuy(a: BuyInfo, b: BuyInfo): number {
  // Compare by last name
  if (a.resourceId !== b.resourceId) {
    return a.resourceId.localeCompare(b.resourceId);
  }
  // If last names are equal, compare by first name
  return a.buyingPrice - b.buyingPrice;
}

function calcConsumeEnergy(
  simState: SimulationState,
  villager: Villager,
  resource: ResourceId
): number {
  const attribtueAffinity = simState.resources.get(resource).attirbuteAffinity;

  let energy = minConsumeEnergy;
  let totalAttribute = 0;
  for (let i = 0; i < attribtueAffinity.length; i++) {
    let attribute = attribtueAffinity[i];
    const characterAttributes = villager.characterAttributes;
    if (attribute in villager.characterAttributes) {
      totalAttribute += villager.characterAttributes[attribute].totalValue;
    }
  }

  return energy + totalAttribute * 0.2;
}
