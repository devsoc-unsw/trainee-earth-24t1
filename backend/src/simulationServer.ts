import {
  SimulationState,
  Villager,
  BuyInfo,
  SellInfo,
  ResourceId,
  VillagerId,
  buyPref,
  villagerAssignType,
  TradeInfo,
  TransactionsType,
  resourceOrigin,
  AttributeValue,
  Pos,
  Cells,
  serializePosStr,
  PosStr,
  Dimensions,
  EnviroObjectType,
  EnviroObject,
} from "@backend/types/simulationTypes.ts";

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
const TICKS_PER_CYCLE = 10;
import { UpdateFn } from "@backend/src/gameloopFramework.js";
import { Assets } from "@backend/types/assetTypes.ts";
import {
  ServerMessageType,
  SimStateAssetsServerMsg,
  WebsocketClients,
} from "@backend/types/wsTypes.ts";
import { serializeMapToJSON } from "@backend/utils/objectTyping.ts";
import { CommunicationServer } from "./clientsServer.ts";

export class SimulationServer {
  private state: SimulationState;
  private assets: Assets;
  private commServer: CommunicationServer;

  constructor(
    state: SimulationState = new SimulationState(),
    assets: Assets = new Map(),
    commServer: CommunicationServer
  ) {
    this.state = state;
    this.assets = assets;
    this.commServer = commServer;
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
        let baseValue = Math.ceil(Math.random() * (maxAttribute - 0));
        if (attributeId == "Speed" || attributeId == "Strength") {
          baseValue = Math.ceil(Math.random() * (maxAttribute - 7) + 7);
        }
        const instance = new AttributeValue(baseValue);

        villager.characterAttributes[attributeId] = instance;
      });
    });

    let villagersWorking = Math.ceil(this.state.villagers.size * 0.75);

    const resourcesRandom = getRandomUniqueNumbers(
      0,
      this.state.resources.size,
      villagersWorking,
      this.state
    );

    let workerList = Array.from(this.state.villagers.keys());

    const producedResources: ResourceId[] = [];
    let increment = villagersWorking / normalPriceRange;
    let i = 0;
    for (; i < villagersWorking; i++) {
      let worker = this.state.villagers.get(workerList[i]);

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

      this.commServer.broadcastSimStateAssets(this.state, this.assets);
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

    this.state.villagers.forEach((villager, villagerId) => {
      if (villager.assignment !== null) {
        const resource = this.state.resources.get(villager.assignment.resource);
        const productionObject = this.state.enviroObjects.get(
          resource.productionObject
        );
        const pos = productionObject.pos;
        const dim = this.assets.get(productionObject.asset).dimensions;

        findDestOutside(this.state, dim, villager, pos);
      } else {
        let cosmetcObjects: EnviroObject[] = [];
        this.state.enviroObjects.forEach((object, objectId) => {
          if (object.enviroType === EnviroObjectType.COSMETIC) {
            cosmetcObjects.push(object);
          }
        });

        const randomIndex = Math.floor(Math.random() * cosmetcObjects.length);

        findDestOutside(
          this.state,
          this.assets.get(cosmetcObjects[randomIndex].asset).dimensions,
          villager,
          cosmetcObjects[randomIndex].pos
        );
      }
    });
  };

  /**
   * Servers as the update function to the gameloop framework.
   * Gets called by the gameloop framework at its specified framerate e.g. 20fps.
   */
  simulationStep: UpdateFn = (delta: number, counter: number) => {
    console.log(`\n========\nStep simulation forward one timestep`);
    const jsonData = this.state.serialize();

    if (counter === 600) {
      let jsonData = this.state.serialize();
      fs.writeFileSync("output_test2.json", JSON.stringify(jsonData));
    }

    /**
     * making trades
     */

    if (counter % TICKS_PER_CYCLE === 0) {
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

      let villagerList: Map<VillagerId, number> = new Map();

      for (let i in transactionList) {
        const villagerSell = this.state.villagers.get(
          transactionList[i].villagerSell
        );

        if (
          !villagerList.has(villagerSell._id) &&
          !villagerList.has(transactionList[i].villagerBuy)
        ) {
          const house = this.state.enviroObjects.get(villagerSell.houseObject);
          const pos = house.pos;
          const dim = this.assets.get(house.asset).dimensions;
          findDestOutside(this.state, dim, villagerSell, pos);
          findDestOutside(
            this.state,
            dim,
            this.state.villagers.get(transactionList[i].villagerBuy),
            pos
          );

          villagerList.set(villagerSell._id, 1);
          villagerList.set(transactionList[i].villagerBuy, 1);
        }
      }

      this.state.villagers.forEach((villager, villagerId) => {
        if (!villagerList.has(villagerId)) {
          let cosmetcObjects: EnviroObject[] = [];
          this.state.enviroObjects.forEach((object, objectId) => {
            if (object.enviroType === EnviroObjectType.COSMETIC) {
              cosmetcObjects.push(object);
            }
          });

          const randomIndex = Math.floor(Math.random() * cosmetcObjects.length);

          findDestOutside(
            this.state,
            this.assets.get(cosmetcObjects[randomIndex].asset).dimensions,
            villager,
            cosmetcObjects[randomIndex].pos
          );
        }
      });
      /**
       * end of makikng trades
       */
    }

    /**
     * Production assignment
     */

    if ((counter + Math.floor(TICKS_PER_CYCLE / 2)) % TICKS_PER_CYCLE === 0) {
      this.state.villagers.forEach((villager, villagerId) => {
        villager.assignment = null;
      });

      const soldList = new Map<
        ResourceId,
        { totalPrice: number; totalQuantity: number }
      >();

      if (Array.isArray(this.state.transactions)) {
        for (let i = 0; i < this.state.transactions.length; i++) {
          let transaction = this.state.transactions[i];

          soldList.set(transaction.resourceId, {
            totalPrice: transaction.salePrice,
            totalQuantity: transaction.saleQuantity,
          });
        }
      }

      const sortedSold: { resourceId: ResourceId; averagePrice: number }[] = [];

      soldList.forEach((resource, resourceId) => {
        let averagePrice = resource.totalPrice / resource.totalQuantity;
        sortedSold.push({ resourceId, averagePrice });
      });

      sortedSold.sort((a, b) => b.averagePrice - a.averagePrice);

      let workingVillagers: Villager[] = [];

      this.state.villagers.forEach((villager, villagerId) => {
        if (villager.energy >= minProductionEnergy) {
          villager.assignedPlant = false;
          workingVillagers.push(villager);
        }
      });

      const nBestSelling = Math.ceil(sortedSold.length * 0.2);
      //console.log(sortedSold.length);

      let workAtBest = workingVillagers.length * 0.3;

      const nWorkersAtBest: number[] = [];

      for (let i = 0; i < sortedSold.length; i++) {
        if (i < nBestSelling % workAtBest) {
          nWorkersAtBest.push(1);
        } else {
          nWorkersAtBest.push(0);
        }
      }

      let workers = Math.ceil(workAtBest - (nBestSelling % workAtBest));
      let i = 0;

      while (workers > 0) {
        for (let j = 0; j < nBestSelling - i; j++) {
          if (workers > 0) {
            nWorkersAtBest[j]++;
            workers--;
          }
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

      workers = Math.floor(workAtBest);

      while (workers != 0) {
        for (let i = 0; i < Math.floor(nBestSelling); i++) {
          let worker = workAssigns[i].villagerList[0];
          let nItems = 0;

          if (nWorkersAtBest[i] <= 0) {
            i++;

            continue;
          }
          for (let j = 1; worker.villager.assignment != null; j++) {
            worker = workAssigns[i].villagerList[j];
            nItems = worker.itemsMade;
          }

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

          this.sendVillagerAssignment(
            this.state,
            worker.villager._id,
            sortedSold[i].resourceId
          );
        }
      }

      workers = workingVillagers.length - workAtBest;

      const nPlants = sortedSold.length - nBestSelling;

      let atEachPlant = nPlants / workers;

      for (let i = 0; i < atEachPlant; i++) {
        for (let j = 0; workers > 0 && j < nPlants; j++) {
          let worker = workAssigns[i].villagerList[0];

          let nItems = 0;
          for (let k = 1; worker.villager.assignment != null; k++) {
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
        }
      }

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

      if (nullAssignments < this.state.resources.size * 0.6) {
        let increment = villagersWorking / normalPriceRange;
        let i = 0;
        for (; i < villagersWorking * 0.7; i++) {
          let worker = this.state.villagers.get(workerList[i]._id);

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

        resourcesAvailable.sort((a, b) => b.energy - a.energy);

        let itemsConsumed = 3;

        for (let i = 0; itemsConsumed > 0; i++) {
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
      /**
       * end of consumption assignment
       */
      this.state.villagers.forEach((villager, villagerId) => {
        if (villager.assignment !== null) {
          const resource = this.state.resources.get(
            villager.assignment.resource
          );
          const productionObject = this.state.enviroObjects.get(
            resource.productionObject
          );
          const pos = productionObject.pos;
          const dim = this.assets.get(productionObject.asset).dimensions;

          findDestOutside(this.state, dim, villager, pos);
        } else {
          let cosmetcObjects: EnviroObject[] = [];
          this.state.enviroObjects.forEach((object, objectId) => {
            if (object.enviroType === EnviroObjectType.COSMETIC) {
              cosmetcObjects.push(object);
            }
          });

          const randomIndex = Math.floor(Math.random() * cosmetcObjects.length);

          findDestOutside(
            this.state,
            this.assets.get(cosmetcObjects[randomIndex].asset).dimensions,
            villager,
            cosmetcObjects[randomIndex].pos
          );
        }
      });
    }

    this.commServer.broadcastSimStateAssets(this.state, this.assets);
  };
}

function consumeResource(
  worker: Villager,
  id: ResourceId,
  resourcesAvailable: { resource: ResourceId; energy: number }[],
  i: number,
  consumedResources: { [key: ResourceId]: number }
) {
  if (!worker?.resources[id]) {
    return;
  }
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
    const villagerResource = villager.resources[resourceId];
    if (
      villagerResource &&
      villagerResource.buyPrice &&
      villagerResource.buyState
    )
      list.push({
        villagerId: villager._id,
        resourceId: resourceId,
        buyingPrice: villagerResource.buyPrice,
        buyingState: villagerResource.buyState,
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
    const villagerResource = villager.resources[resourceId];
    if (
      villagerResource &&
      villagerResource.sellPrice &&
      villagerResource.isSelling
    )
      list.push({
        villagerId: villager._id,
        resourceId: resourceId,
        sellingPrice: villagerResource?.sellPrice ?? 0,
        sellingQuantity: villagerResource?.isSelling ?? 0,
        sold: false,
      });
  });
}

function updateVillagersBuySell(
  simState: SimulationState,
  transactionInfo: TradeInfo
) {
  const villagerBuy = simState.villagers.get(transactionInfo.villagerBuy);
  const villagerSell = simState.villagers.get(transactionInfo.villagerSell);

  if (
    !villagerBuy ||
    !transactionInfo?.resourceId ||
    !villagerBuy.resources[transactionInfo.resourceId] ||
    !villagerSell ||
    !transactionInfo?.resourceId ||
    !villagerSell.resources[transactionInfo.resourceId]
  ) {
    console.log("Villager not found");
  }

  villagerBuy.resources[transactionInfo.resourceId].total +=
    transactionInfo.saleQuantity;
  villagerSell.resources[transactionInfo.resourceId].total -=
    transactionInfo.saleQuantity;

  villagerBuy.coins -= transactionInfo.salePrice;
  villagerSell.coins += transactionInfo.salePrice;

  villagerSell.resources[transactionInfo.resourceId].isSelling -=
    transactionInfo.saleQuantity;

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

function findVillagerPath(
  simState: SimulationState,
  villager: Villager,
  dest: Pos
) {
  const initaliseValue: Pos = { x: -100, y: -100 };

  let pred: Map<string, Pos> = new Map();
  const q = new Queue<Pos>();

  const src = villager.pos;

  pred.set(serializePosStr(src), villager.pos);
  q.enqueue(villager.pos);

  let pathFound: boolean | Pos = false;
  //console.log(villager._id, villager.pos, dest);

  while (!q.isEmpty() && !pathFound) {
    let v = q.dequeue();

    let xStart = v.x - 1;
    let yStart = v.y - 1;

    for (let i = 0; i < 3 && !pathFound; i++) {
      for (let j = 0; j < 3 && !pathFound; j++) {
        let w = { x: xStart + i, y: yStart + j };
        if (w.x === dest.x && w.y === dest.y) {
          pathFound = true;
          pred.set(serializePosStr(w), v);
        } else if (checkCanVisit(simState, w, v, pred) === true) {
          pred.set(serializePosStr(w), v);
          q.enqueue(w);
        }
      }
    }
  }

  let path: PosStr[] = [];
  if (pred.has(serializePosStr(dest))) {
    let v = dest;
    while (v != src) {
      path.unshift(serializePosStr(v));
      v = pred.get(serializePosStr(v));
    }
    path.unshift(serializePosStr(src));
    villager.pos = dest;
  }

  villager.villagerPath = path;
}

function checkCanVisit(
  simState: SimulationState,
  w: Pos,
  v: Pos,
  pred: Map<string, Pos>
): boolean {
  if (w === v) return false;

  if (pred.has(serializePosStr(w))) return false;

  const cell = simState.worldMap.cells.get(serializePosStr(w));
  if (!simState.worldMap.cells.has(serializePosStr(w))) return false;

  if (simState.worldMap.cells.get(serializePosStr(w)).object !== null)
    return false;

  return true;
}

function findDestOutside(
  simState: SimulationState,
  dim: Dimensions,
  villager: Villager,
  pos: Pos
) {
  let xStart = pos.x - Math.ceil(dim.dx / 2);
  let yStart = pos.y - Math.ceil(dim.dy / 2);
  let dest = { x: xStart, y: yStart };

  for (let i = xStart; i < pos.x + dim.dx - Math.ceil(dim.dx / 2) + 2; i++) {
    for (let j = yStart; j < pos.y + dim.dy - Math.ceil(dim.dy / 2) + 2; j++) {
      dest = { x: i, y: j };

      if (
        simState.worldMap.cells.has(serializePosStr(dest)) &&
        simState.worldMap.cells.get(serializePosStr(dest)).object === null
      ) {
        findVillagerPath(simState, villager, dest);
        return;
      }
    }
  }
}

class Queue<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  enqueue(element: T): void {
    this.items.push(element);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items.shift();
  }

  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

function serializePos(pos: Pos) {
  throw new Error("Function not implemented.");
}
