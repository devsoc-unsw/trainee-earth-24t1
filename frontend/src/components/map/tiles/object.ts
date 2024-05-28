import { DEBUG_MAP_VIS, drawPoint, getTransformedPoint } from "../WorldMap";
import { Dimensions } from "@backend/types/simulationTypes";
import Tile, { Coords } from "./tile";

// Normally will Tile.draw() will only render tiles that are visible in the bounds
// of the canvas, excluding the tiles that are completely out of the canvas.
// Set this option true to exclude also one line of tiles that are partially
// visible on the canvas edge, just to demonstrate it working.
const CONFIRM_OUT_OF_BOUND = true;

export type EnviroObjectPropsType = {
  mapStartPosition: Coords;
  tilePos: Coords;
  tileImage: HTMLImageElement;
  dimensions: Dimensions;
  ctx: CanvasRenderingContext2D;
};

/**
 * @deprecated use MapObject instead
 */
class EnviroObject {
  mapStartPosition: Coords;
  tilePos: Coords;
  offsetTilePos: Coords;
  tileImage: HTMLImageElement;
  dimensions: Dimensions;
  ctx: CanvasRenderingContext2D;

  renderPosition: Coords;

  constructor(props: EnviroObjectPropsType) {
    this.tileImage = props.tileImage;
    this.mapStartPosition = props.mapStartPosition;
    this.tilePos = props.tilePos;
    this.dimensions = props.dimensions;
    this.ctx = props.ctx;

    // bottom left tile
    this.offsetTilePos = {
      x: this.tilePos.x - Math.floor(this.dimensions.dx / 2),
      y: this.tilePos.y + Math.floor(this.dimensions.dy / 2),
    };

    this.renderPosition = this.calculateRenderPosition(this.offsetTilePos);
  }

  private calculateRenderPosition(tilePos: Coords): Coords {
    const numTilesOffset = Math.floor(this.dimensions.dx / 2);

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
    const scaledWidth = 2 * this.dimensions.dx * (Tile.TILE_WIDTH / 2);
    const scaledHeight =
      (scaledWidth / this.tileImage.width) * this.tileImage.height;

    const offsetY =
      tileHeight - scaledHeight + (this.dimensions.dx / 2) * Tile.TILE_HEIGHT;
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
