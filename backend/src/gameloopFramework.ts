/**
 * Adapted from https://github.com/timetocode/node-game-loop
 */

export type UpdateFn = (delta: number) => void;

/**
 * Gameloop framework. Inject your custom game update function. This framework
 * will run your update function at a specified framerate (tickLengthMs)
 *
 * Usage:
 *      const myUpdateFn = () => {console.log("Update");};
 *      const myGameLoop = new GameLoop(myUpdateFn);
 *      myGameLoop.startGameLoop();
 *      myGameLoop.pauseGameLoop();
 *      myGameLoop.resumGameLoop();
 *      myGameLoop.finisGameLoop();
 */
export class GameLoop {
  /**
   * Length of a tick in milliseconds. The denominator is your desired framerate.
   * e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
   */
  readonly tickLengthMs = 1000 / 20;

  /* gameLoop related variables */
  // timestamp of each loop
  private previousTick: number;
  // number of times gameLoop gets called
  private actualTicks: number;

  private readonly update: UpdateFn;

  constructor(update: UpdateFn) {
    this.update = update;
  }

  private gameLoop() {
    var now = Date.now();

    this.actualTicks++;
    if (this.previousTick + this.tickLengthMs <= now) {
      var delta = (now - this.previousTick) / 1000;
      this.previousTick = now;

      this.update(delta);

      console.log(
        "delta",
        delta,
        "(target: " + this.tickLengthMs + " ms)",
        "node ticks",
        this.actualTicks
      );
      this.actualTicks = 0;
    }

    if (Date.now() - this.previousTick < this.tickLengthMs - 16) {
      setTimeout(this.gameLoop);
    } else {
      setImmediate(this.gameLoop);
    }
  }

  startGameLoop() {
    this.previousTick = Date.now();
    this.actualTicks = 0;

    this.gameLoop();
  }

  pauseGameLoop() {
    // TODO
  }

  resumGameLoop() {
    // TODO
  }

  finisGameLoop() {
    // TODO
  }
}

/**
Update is normally where all of the logic would go. In this case we simply call
a function that takes 10 milliseconds to complete thus simulating that our game
had a very busy time.
*/
export const dummyUpdate = function (delta) {
  console.log(`Running dummy update. Time ${Date.now()}; Delta: ${delta}`);
  aVerySlowFunction(10);
};

/**
A function that wastes time, and occupies 100% CPU while doing so.
Suggested use: simulating that a complex calculation took time to complete.
*/
const aVerySlowFunction = function (milliseconds) {
  // waste time
  var start = Date.now();
  while (Date.now() < start + milliseconds) {}
};
