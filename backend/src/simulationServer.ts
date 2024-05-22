import { Asset, AssetId } from "asset-gen/generate-asset.ts";
import { UpdateFn } from "./gameloopFramework.js";
import { SimulationState, Villager } from "src/types/simulationTypes.ts";

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

  /**
   * Servers as the update function to the gameloop framework.
   * Gets called by the gameloop framework at its specified framerate e.g. 20fps.
   */
  simulationStep: UpdateFn = (delta: number) => {
    console.log(`Step simulation forward one timestep`);
    this.state.show();
  };
}
