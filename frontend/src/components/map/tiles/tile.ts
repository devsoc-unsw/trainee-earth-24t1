import { getTransformedPoint } from "@frontend/src/components/map/WorldMap";

// Normally will Tile.draw() will only render tiles that are visible in the bounds
// of the canvas, excluding the tiles that are completely out of the canvas.
// Set this option true to exclude also one line of tiles that are partially
// visible on the canvas edge, just to demonstrate it working.
const CONFIRM_OUT_OF_BOUND = false;

// Use to represent (x,y) position on canvas
// For (x,y) position on tile map, use Pos2D
export type Coords = {
  x: number;
  y: number;
};

export type TilePropsType = {
  mapStartPosition: Coords;
  tileIndex: Coords;
  tileImage: HTMLImageElement;
  ctx: CanvasRenderingContext2D;
};

export default class Tile {
  static readonly UNIT = 48;
  static readonly UNIT_HALF = this.UNIT / 2;

  // THESE SHOULD BE CHANGED OR SET DYNAMICALLY
  static readonly TILE_WIDTH = 2 * this.UNIT;
  static readonly TILE_HEIGHT = this.TILE_WIDTH / Math.sqrt(3);
  // static readonly TILE_HEIGHT = this.TILE_WIDTH / 2;

  static readonly TILE_HALF_WIDTH = this.TILE_WIDTH / 2;
  static readonly TILE_HALF_HEIGHT = this.TILE_HEIGHT / 2;

  static readonly TILE_TYPE_EMPTY = 0;

  mapStartPosition: Coords;
  tileIndex: Coords;
  tileImage: HTMLImageElement;
  ctx: CanvasRenderingContext2D;

  renderPosition: Coords;

  constructor(props: TilePropsType) {
    this.tileImage = props.tileImage;
    this.mapStartPosition = props.mapStartPosition;
    this.tileIndex = props.tileIndex;
    this.renderPosition = this.calculateRenderPosition(props.tileIndex);
    this.ctx = props.ctx;
  }

  private calculateRenderPosition(tileIndex: Coords): Coords {
    const renderX =
      this.mapStartPosition.x +
      (tileIndex.x - tileIndex.y) * Tile.TILE_HALF_WIDTH;
    const renderY =
      this.mapStartPosition.y +
      (tileIndex.x + tileIndex.y) * Tile.TILE_HALF_HEIGHT;
    return { x: renderX, y: renderY };
  }

  drawTile(tileHeight: number): void {
    const offsetY = tileHeight - this.tileImage.height;
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
      return;
    }
    this.ctx.drawImage(
      this.tileImage,
      this.renderPosition.x,
      this.renderPosition.y + offsetY
    );
  }
}
