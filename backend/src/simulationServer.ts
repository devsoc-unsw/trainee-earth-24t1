import { UpdateFn } from "./gameloopFramework.js";

/**
 * Servers as the update function to the gameloop framework.
 * Gets called by the gameloop framework at its specified framerate e.g. 20fps.
 */
export const simulationStep: UpdateFn = (delta: number) => {
  console.log(`Step simulation forward one timestep`);
};
