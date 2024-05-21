import { UpdateFn } from "./gameloopFramework.js";
import { SimulationState } from "./types/simulationTypes.ts";

export class SimulationServer {
  private state: SimulationState;

  constructor(state: SimulationState = new SimulationState()) {
    this.state = state;
  }

  /**
   * Servers as the update function to the gameloop framework.
   * Gets called by the gameloop framework at its specified framerate e.g. 20fps.
   */
  simulationStep: UpdateFn = (delta: number) => {
    console.log(`Step simulation forward one timestep`);
  };
}
