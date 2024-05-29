import { UpdateFn } from "@backend/src/gameloopFramework.js";
import { Assets } from "@backend/types/assetTypes.ts";
import { SimulationState } from "@backend/types/simulationTypes.ts";

export class SimulationServer {
  private state: SimulationState;
  private assets: Assets;

  constructor(
    state: SimulationState = new SimulationState(),
    assets: Assets = new Map()
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
