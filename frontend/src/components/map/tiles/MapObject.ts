import {
  DEBUG_MAP_VIS,
  posToIsoCoords,
  drawPoint,
  drawSquare,
  getTransformedPoint,
} from "@frontend/src/components/map/WorldMap";
import Tile, { Coords } from "./tile";
import { Pos, Dimensions } from "@backend/types/simulationTypes";
import { Coordinates } from "@dnd-kit/core/dist/types";

// Normally will Tile.draw() will only render tiles that are visible in the bounds
// of the canvas, excluding the tiles that are completely out of the canvas.
// Set this option true to exclude also one line of tiles that are partially
// visible on the canvas edge, just to demonstrate it working.
const CONFIRM_OUT_OF_BOUND = false;

export default class MapObject {
  pos: Pos;
  // Elevation from ground, in tile units
  elevation: number;
  dimensions: Dimensions;
  htmlImage: HTMLImageElement;

  constructor(
    imgUrl: string,
    initCoords: Coordinates,
    elevation: number,
    dimensions: Dimensions
  ) {
    this.htmlImage = new Image();
    this.htmlImage.src = imgUrl;
    this.pos = initCoords;
    this.elevation = elevation;
    this.dimensions = dimensions;
  }

  // Calculate final render position on screen using isometric projection
  static calculateBotLeftTileCoords(
    originCoords: Coords,
    pos: Pos,
    dimensions: Dimensions
  ): Coords {
    const botLeftTilePos = {
      x: pos.x - Math.floor(dimensions.dx / 2),
      y: pos.y + Math.floor(dimensions.dy / 2),
    };
    const botLeftCoords = posToIsoCoords(originCoords, botLeftTilePos);
    // const renderX =
    //   this.originPos.x + (this.coords.x - this.coords.y) * Tile.TILE_HALF_WIDTH;
    // const renderY =
    //   this.originPos.y +
    //   (this.coords.x + this.coords.y) * Tile.TILE_HALF_HEIGHT;
    return botLeftCoords;
  }

  updateCoords(newCoords: Coordinates) {
    this.pos = newCoords;
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
      boundingBoxTopLeft.x + (CONFIRM_OUT_OF_BOUND ? 0 : scaledWidth),
      boundingBoxTopLeft.y + (CONFIRM_OUT_OF_BOUND ? 0 : scaledHeight)
    );
    const transformedCoordsBotRight = getTransformedPoint(
      ctx.getTransform().inverse(),
      boundingBoxTopLeft.x +
        scaledWidth -
        (CONFIRM_OUT_OF_BOUND ? 0 : scaledWidth),
      boundingBoxTopLeft.y +
        scaledHeight -
        (CONFIRM_OUT_OF_BOUND ? 0 : scaledHeight)
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
