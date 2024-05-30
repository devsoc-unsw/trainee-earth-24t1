import {
  DEBUG_MAP_VIS,
  posToIsoCoords,
  drawPoint,
  drawSquare,
  getTransformedPoint,
} from "@frontend/src/WorldMap";
import Tile, { Coords } from "./tile";
import {
  Dimensions,
  EnviroObjectId,
  Pos,
  VillagerId,
} from "@backend/types/simulationTypes";

// Normally will Tile.draw() will only render tiles that are visible in the bounds
// of the canvas, excluding the tiles that are completely out of the canvas.
// Set this option true to exclude also one line of tiles that are partially
// visible on the canvas edge, just to demonstrate it working.
const CONFIRM_OUT_OF_BOUND = false;

const MAX_ACC = 0.0001;
const MAX_VEL = 0.005;

export default class MapObject {
  htmlImage: HTMLImageElement;
  pos: Pos;
  // Elevation from ground, in tile units
  elevation: number;
  dimensions: Dimensions;
  objectId: EnviroObjectId | VillagerId | null;
  vel: Pos = { x: 0, y: 0 };
  acc: Pos = { x: 0, y: 0 };

  constructor(
    imgUrl: string,
    pos: Pos,
    elevation: number,
    dimensions: Dimensions,
    objectId: EnviroObjectId | VillagerId | null
  ) {
    this.htmlImage = new Image();
    this.htmlImage.src = imgUrl;
    this.pos = pos;
    this.elevation = elevation;
    this.dimensions = dimensions;
    this.objectId = objectId;
  }

  // Calculate final render position on screen using isometric projection
  static calculateBotLeftTileCoords(
    originCoords: Coords,
    pos: Pos,
    dimensions: Dimensions
  ): Coords {
    const botLeftTilePos = {
      x: pos.x - Math.floor(dimensions.dx / 2),
      y: pos.y + Math.ceil(dimensions.dy / 2) - 1,
    };
    const botLeftCoords = posToIsoCoords(originCoords, botLeftTilePos);
    // const renderX =
    //   this.originPos.x + (this.coords.x - this.coords.y) * Tile.TILE_HALF_WIDTH;
    // const renderY =
    //   this.originPos.y +
    //   (this.coords.x + this.coords.y) * Tile.TILE_HALF_HEIGHT;
    return botLeftCoords;
  }

  /**
   *
   * Jump to pos without respecting physics
   */
  updatePos(newPos: Pos) {
    this.pos = newPos;
  }

  setAcc(newAcc: Pos) {
    this.acc = newAcc;
    const accMag = Math.sqrt(this.acc.x ** 2 + this.acc.y ** 2);

    if (accMag > MAX_ACC) {
      this.acc.x = (this.acc.x / accMag) * MAX_ACC;
      this.acc.y = (this.acc.y / accMag) * MAX_ACC;
    }
  }

  setVel(newVel: Pos) {
    this.vel = newVel;
    const velMag = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2);

    if (velMag > MAX_VEL) {
      this.vel.x = (this.vel.x / velMag) * MAX_VEL;
      this.vel.y = (this.vel.y / velMag) * MAX_VEL;
    }
  }

  /**
   * Delta in milliseconds
   */
  update(delta: number) {
    // this.vel.x += this.acc.x;
    // this.vel.y += this.acc.y;

    // const velMag = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2);
    // if (velMag > MAX_VEL) {
    //   this.vel.x = (this.vel.x / velMag) * MAX_VEL;
    //   this.vel.y = (this.vel.y / velMag) * MAX_VEL;
    // }

    this.pos.x += this.vel.x * delta;
    this.pos.y += this.vel.y * delta;

    this.acc.x = 0;
    this.acc.y = 0;
  }

  drawTile(ctx: CanvasRenderingContext2D, originPos: Coords): void {
    const botLeftTilePos = MapObject.calculateBotLeftTileCoords(
      originPos,
      this.pos,
      this.dimensions
    );

    const scaledWidth = this.dimensions.dx * Tile.TILE_WIDTH;
    const scaledHeight =
      (scaledWidth / this.htmlImage.width) * this.htmlImage.height;

    // bounding box bottom left point of the bot-left tile
    const boundingBoxBotLeft: Coords = {
      x: botLeftTilePos.x - Tile.TILE_HALF_WIDTH,
      y: botLeftTilePos.y + Tile.TILE_HALF_HEIGHT,
    };
    const boundingBoxTopLeft: Coords = {
      ...boundingBoxBotLeft,
      y:
        boundingBoxBotLeft.y -
        scaledHeight -
        // elevate upwards on the screen
        this.elevation +
        // offset downwards to align with bottom left corner of bounding box
        (this.dimensions.dx / 2) * Tile.TILE_HEIGHT,
    };

    // === If tile not visible, don't draw it ===
    const transformedCoordsTopLeft = getTransformedPoint(
      ctx.getTransform().inverse(),
      {
        x: boundingBoxTopLeft.x + (CONFIRM_OUT_OF_BOUND ? 0 : scaledWidth),
        y: boundingBoxTopLeft.y + (CONFIRM_OUT_OF_BOUND ? 0 : scaledHeight),
      }
    );
    const transformedCoordsBotRight = getTransformedPoint(
      ctx.getTransform().inverse(),
      {
        x:
          boundingBoxTopLeft.x +
          scaledWidth -
          (CONFIRM_OUT_OF_BOUND ? 0 : scaledWidth),
        y:
          boundingBoxTopLeft.y +
          scaledHeight -
          (CONFIRM_OUT_OF_BOUND ? 0 : scaledHeight),
      }
    );

    if (
      transformedCoordsTopLeft.x < 0 ||
      transformedCoordsBotRight.x > ctx.canvas.width ||
      transformedCoordsTopLeft.y < 0 ||
      transformedCoordsBotRight.y > ctx.canvas.height
    ) {
      return;
    }

    ctx.drawImage(
      this.htmlImage,
      boundingBoxTopLeft.x,
      boundingBoxTopLeft.y,
      scaledWidth,
      scaledHeight
    );

    if (DEBUG_MAP_VIS) {
      drawSquare(
        ctx,
        {
          x: boundingBoxTopLeft.x,
          y: boundingBoxTopLeft.y,
        },
        { dx: scaledWidth, dy: scaledHeight },
        "violet",
        5
      );
    }

    if (DEBUG_MAP_VIS) {
      drawPoint(ctx, botLeftTilePos, "hotpink", 4);
    }
    if (DEBUG_MAP_VIS) {
      drawPoint(ctx, boundingBoxBotLeft, "turquoise", 4);
    }
  }
}
