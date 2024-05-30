/**
 * Adapted from https://github.com/timetocode/node-game-loop
 */

export type UpdateFn = (delta: number, counter: number) => void;
type GameLoopFn = () => void;

/**
 * Gameloop framework. Inject your custom game update function. This framework
 * will run your update function at a specified framerate (frameLengthMs)
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
   * e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps,
   * 1000 / (1/8) = 1/8th frames per second ie 8 seconds per frame
   */
  readonly frameLengthMs = 1000 / (1 / 8);

  /**
   * Period of time right before the next frame is intended to begin,
   * during which we make the gameloop use setImmediate instead of setTimeout
   * to schedule the next gameloop tick. According to article below, nodejs
   * setTimeout schedules the next tick within a 16-32ms error margin.
   * https://timetocode.tumblr.com/post/71512510386/
   */
  readonly accurateTickPeriodMs = 32;

  /**
   * Minimum delay in milliseconds for setTimeout. Must be smaller than
   * accurateTickPeriodMs so that the gameloop will always have a chance
   * to use setImmediate to schedule the next tick, before a setTimeout
   * delay overshoots the intended time of next tick.
   */
  readonly minSetTimeoutDelayMs = this.accurateTickPeriodMs / 2.1;

  /* gameLoop related variables */
  // timestamp of each loop
  private previousTick: number;
  // number of times gameLoop gets called
  private actualTicks: number;

  private readonly update: UpdateFn;

  private gameLoop: GameLoopFn;

  private counter: number;

  constructor(update: UpdateFn) {
    this.update = update;
    this.counter = 0;

    // assert(
    //   this.accurateTickPeriodMs > this.minSetTimeoutDelayMs,
    //   "accurateTickPeriodMs must be greater than minSetTimeoutDelayMs"
    // );
  }

  startGameLoop() {
    this.previousTick = Date.now();
    this.actualTicks = 0;
    let setTimeoutCount = 0;
    let setImmediateCount = 0;
    this.counter = 0;

    if (!this.gameLoop) {
      const gameLoop = () => {
        let now = Date.now();
        let progress = now - this.previousTick;

        this.actualTicks++;
        if (progress >= this.frameLengthMs) {
          var delta = now - this.previousTick;
          this.previousTick = now;

          this.update(delta, this.counter);
          this.counter++;

          console.log(
            `delta ${delta}ms;`,
            `target: ${this.frameLengthMs} ms;`,
            `node ticks: ${this.actualTicks};`,
            `setTimeoutCount: ${setTimeoutCount};`,
            `setImmediateCount: ${setImmediateCount};`
          );
          this.actualTicks = 0;
          setTimeoutCount = 0;
          setImmediateCount = 0;
        }

        now = Date.now();
        progress = now - this.previousTick;
        if (progress < this.frameLengthMs - this.accurateTickPeriodMs) {
          setTimeoutCount++;
          setTimeout(
            gameLoop,
            Math.max(
              (this.frameLengthMs - this.accurateTickPeriodMs - progress) / 2,
              this.minSetTimeoutDelayMs
            )
            // setTimout delay must be lower-bounded at some value smaller than 16 in order
            // to avoid the inacurrate setTimeout delay from "overshooting"
            // beyond this.previousTick + this.frameLengthMs.
          );
        } else {
          setImmediateCount++;
          setImmediate(gameLoop);
        }
      };
      this.gameLoop = gameLoop;
    }

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
