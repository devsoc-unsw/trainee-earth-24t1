import {
  DEBUG_MAP_VIS,
  coordToIsoVec,
  drawPoint,
  drawSquare,
  getTransformedPoint,
} from "@frontend/src/components/map/WorldMap";
import Tile, { Pos2D } from "./tile";
import { Coords, Dimensions } from "@backend/types/simulationTypes";
import { Coordinates } from "@dnd-kit/core/dist/types";

// Normally will Tile.draw() will only render tiles that are visible in the bounds
// of the canvas, excluding the tiles that are completely out of the canvas.
// Set this option true to exclude also one line of tiles that are partially
// visible on the canvas edge, just to demonstrate it working.
const CONFIRM_OUT_OF_BOUND = false;

export default class MapObject {
  originPos: Pos2D;
  coords: Coords;
  // Elevation from ground, in tile units
  elevation: number;
  dimensions: Dimensions;
  htmlImage: HTMLImageElement;

  // Cached canvas position of bottom left tile's coordinate (top-middle of bounding box)
  botLeftTilePos: Pos2D;

  constructor(
    imgUrl: string,
    originPos: Coords,
    initCoords: Coordinates,
    elevation: number,
    dimensions: Dimensions
  ) {
    this.htmlImage = new Image();
    this.htmlImage.src = imgUrl;
    this.originPos = originPos;
    this.coords = initCoords;
    this.elevation = elevation;
    this.dimensions = dimensions;
    // Make sure to calculate after setting this.originPos, this.coords and this.elevation
    this.botLeftTilePos = this.calculateRenderPos();
  }

  // Calculate final render position on screen using isometric projection
  calculateRenderPos(): Pos2D {
    const botLeftTileCoord = {
      x: this.coords.x - Math.floor(this.dimensions.dx / 2),
      y: this.coords.y + Math.floor(this.dimensions.dy / 2),
    };
    const botLeftPos = coordToIsoVec(this.originPos, botLeftTileCoord);
    // const renderX =
    //   this.originPos.x + (this.coords.x - this.coords.y) * Tile.TILE_HALF_WIDTH;
    // const renderY =
    //   this.originPos.y +
    //   (this.coords.x + this.coords.y) * Tile.TILE_HALF_HEIGHT;
    return botLeftPos;
  }

  updateCoords(newCoords: Coordinates) {
    this.coords = newCoords;
    this.botLeftTilePos = this.calculateRenderPos();
  }

  updateOriginPos(newOriginPos: Pos2D) {
    this.originPos = newOriginPos;
    this.botLeftTilePos = this.calculateRenderPos();
  }

  drawTile(ctx: CanvasRenderingContext2D): void {
    const scaledWidth = this.dimensions.dx * Tile.TILE_WIDTH;
    const scaledHeight =
      (scaledWidth / this.htmlImage.width) * this.htmlImage.height;

    // bounding box bottom left point of the bot-left tile
    const boundingBoxBotLeft: Pos2D = {
      x: this.botLeftTilePos.x - Tile.TILE_HALF_WIDTH,
      y: this.botLeftTilePos.y + Tile.TILE_HALF_HEIGHT,
    };
    const boundingBoxTopLeft: Pos2D = {
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
    const transformedPosNW = getTransformedPoint(
      ctx.getTransform().inverse(),
      boundingBoxTopLeft.x + (CONFIRM_OUT_OF_BOUND ? 0 : scaledWidth),
      boundingBoxTopLeft.y + (CONFIRM_OUT_OF_BOUND ? 0 : scaledHeight)
    );
    const transformedPosSE = getTransformedPoint(
      ctx.getTransform().inverse(),
      boundingBoxTopLeft.x +
        scaledWidth -
        (CONFIRM_OUT_OF_BOUND ? 0 : scaledWidth),
      boundingBoxTopLeft.y +
        scaledHeight -
        (CONFIRM_OUT_OF_BOUND ? 0 : scaledHeight)
    );

    console.log(
      window.innerWidth,
      window.innerHeight,
      ctx.canvas.width,
      ctx.canvas.height,
      transformedPosNW,
      transformedPosSE
    );

    if (
      transformedPosNW.x < 0 ||
      transformedPosSE.x > ctx.canvas.width ||
      transformedPosNW.y < 0 ||
      transformedPosSE.y > ctx.canvas.height
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
      drawPoint(ctx, this.botLeftTilePos, "hotpink", 4);
    }
    if (DEBUG_MAP_VIS) {
      drawPoint(ctx, boundingBoxBotLeft, "turquoise", 4);
    }
  }
}
