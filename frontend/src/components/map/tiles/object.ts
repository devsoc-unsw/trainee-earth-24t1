import { DEBUG_MAP_VIS, drawPoint, getTransformedPoint } from "../WorldMap";
import { Dimensions } from "@backend/types/simulationTypes";
import Tile from "./tile";

// Normally will Tile.draw() will only render tiles that are visible in the bounds
// of the canvas, excluding the tiles that are completely out of the canvas.
// Set this option true to exclude also one line of tiles that are partially
// visible on the canvas edge, just to demonstrate it working.
const CONFIRM_OUT_OF_BOUND = true;

export type Pos2D = {
  x: number;
  y: number;
};

export type EnviroObjectPropsType = {
  mapStartPosition: Pos2D;
  tilePos: Pos2D;
  tileImage: HTMLImageElement;
  dimensions: Dimensions;
  ctx: CanvasRenderingContext2D;
};

export default class EnviroObject {
  mapStartPosition: Pos2D;
  tilePos: Pos2D;
  offsetTilePos: Pos2D;
  tileImage: HTMLImageElement;
  dimensions: Dimensions;
  ctx: CanvasRenderingContext2D;

  renderPosition: Pos2D;

  constructor(props: EnviroObjectPropsType) {
    this.tileImage = props.tileImage;
    this.mapStartPosition = props.mapStartPosition;
    this.tilePos = props.tilePos;
    this.dimensions = props.dimensions;
    this.ctx = props.ctx;

    // bottom left
    this.offsetTilePos = {
      x: this.tilePos.x - Math.floor(this.dimensions.width / 2),
      y: this.tilePos.y + Math.floor(this.dimensions.height / 2),
    };

    this.renderPosition = this.calculateRenderPosition(this.offsetTilePos);
  }

  private calculateRenderPosition(tilePos: Pos2D): Pos2D {
    const numTilesOffset = Math.floor(this.dimensions.width / 2);

    const renderX =
      this.mapStartPosition.x +
      (tilePos.x - tilePos.y) * Tile.TILE_HALF_WIDTH -
      0 * numTilesOffset * Tile.TILE_HALF_WIDTH;
    const renderY =
      this.mapStartPosition.y +
      (tilePos.x + tilePos.y) * Tile.TILE_HALF_HEIGHT +
      0 * numTilesOffset * Tile.TILE_HALF_WIDTH;
    return { x: renderX, y: renderY };
  }

  drawTile(tileHeight: number): void {
    const scaledWidth = 2 * this.dimensions.width * (Tile.TILE_WIDTH / 2);
    const scaledHeight =
      (scaledWidth / this.tileImage.width) * this.tileImage.height;

    const offsetY =
      tileHeight -
      scaledHeight +
      (this.dimensions.width / 2) * Tile.TILE_HEIGHT;
    // const offsetY = tileHeight - this.tileImage.height;
    // === If tile not visible, don't draw it ===
    const transformedPosNW = getTransformedPoint(
      this.ctx.getTransform().inverse(),
      this.renderPosition.x + (CONFIRM_OUT_OF_BOUND ? 0 : Tile.TILE_WIDTH),
      this.renderPosition.y +
        offsetY +
        (CONFIRM_OUT_OF_BOUND ? 0 : Tile.TILE_HEIGHT)
    );
    const transformedPosSE = getTransformedPoint(
      this.ctx.getTransform().inverse(),
      this.renderPosition.x + (CONFIRM_OUT_OF_BOUND ? Tile.TILE_WIDTH : 0),
      this.renderPosition.y +
        offsetY +
        (CONFIRM_OUT_OF_BOUND ? Tile.TILE_HEIGHT : 0)
    );

    if (
      transformedPosNW.x < 0 ||
      transformedPosSE.x > this.ctx.canvas.width ||
      transformedPosNW.y < 0 ||
      transformedPosSE.y > this.ctx.canvas.height
    ) {
      // return;
    }

    if (DEBUG_MAP_VIS) {
      drawPoint(this.ctx, this.renderPosition, "coral", 4);
    }

    this.ctx.drawImage(
      this.tileImage,
      this.renderPosition.x,
      this.renderPosition.y + offsetY,
      scaledWidth,
      scaledHeight
    );

    const borderWidth = 2; // Border width
    // Set the border style
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeStyle = "lightsalmon"; // Border color

    // Draw the border (rect)
    if (DEBUG_MAP_VIS)
      this.ctx.strokeRect(
        this.renderPosition.x - borderWidth / 2,
        this.renderPosition.y - borderWidth / 2 + offsetY,
        scaledWidth + borderWidth,
        scaledHeight + borderWidth
      );
  }
}
