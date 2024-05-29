import { useCallback, useRef, useEffect } from "react";
import Tile, { Coords } from "./tiles/tile";
import {
  assets1,
  simulationState1,
} from "@backend/sample-data/simulation_state/map_vis_state_1";
import {
  parsePosStr,
  serializePosStr,
  Dimensions,
  SimulationState,
  Cells,
  EnviroObjectId,
  PosStr,
  Pos,
  VillagerId,
} from "@backend/types/simulationTypes";
import { Asset, Assets } from "@backend/types/assetTypes";
import { deserializeJSONToMap } from "@backend/utils/objectTyping";
import grassTileImgPath from "@frontend/img/special-assets/grass-tile.png";
import MapObject from "./tiles/MapObject";
import { Coordinates } from "@dnd-kit/core/dist/types";
import WSBox from "@frontend/src/reactUseWebSocket";

const DEBUG1 = false;
export const DEBUG_MAP_VIS = false;

// Number of frames for which the render loop runs, including first frame. -1 means run indefinitely.
const FRAME_LIMIT: number = -1;

export type MapProps = {};

export interface IKeys {
  left: boolean;
  up: boolean;
  right: boolean;
  down: boolean;
}

interface IRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

type MapObjectId = EnviroObjectId | VillagerId;

const DEFAULT_MAP_SCALE = 1;
const DEFAULT_DELTA_X = 1;
// Set temporarily (Should be changed once the requirements for UI/UX are all determined)
const ZOOM_SENSITIVITY = 0.0002;
const MAX_SCALE = 2.6;
const MIN_SCALE = 0.4;
const HORIZONTAL_SCROLL_SENSITIVITY = 0.05;

// TODO: FIGURE OUT HOW THIS IS DETERMINED
const MAGIC_NUMBER_TO_ADJUST = 0;

// const TILE_MAP = [
//     [14, 23, 23, 23, 23, 23, 23, 23, 23, 13],
//     [21, 32, 33, 33, 28, 33, 33, 33, 31, 20],
//     [21, 34, 9, 9, 34, 1, 1, 1, 34, 20],
//     [21, 34, 4, 4, 34, 1, 1, 10, 34, 20],
//     [21, 25, 33, 33, 24, 33, 33, 33, 27, 20],
//     [21, 34, 4, 7, 34, 18, 17, 10, 34, 20],
//     [21, 34, 6, 8, 34, 16, 19, 10, 34, 20],
//     [21, 34, 1, 1, 34, 10, 10, 10, 34, 20],
//     [21, 29, 33, 33, 26, 33, 33, 33, 30, 20],
//     [11, 22, 22, 22, 22, 22, 22, 22, 22, 12],
// ];

const DEFAULT_TRANSFORM_MATRIX = DOMMatrix.fromFloat64Array(
  new Float64Array([1, 0, 0, 1, 0, 0])
);

const MAX_VEL = 0.41; // distance units per second
const MIN_VEL = 0.005; // distance units per second
// Acceleration in distance units per second squared.
// NOTE: MUST be greater than MIN_VEL, otherwise acceleration will not be able
// to overcome the minimum velocity.
const ACCEL = 0.016;
const VEL_DAMPER = 0.94; // 0.9 means 90% of velocity is kept each frame

const WorldMap = ({}: MapProps) => {
  const frameCount = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Coords of the origin of the map, raw ie before panzoom transformation
  // Derived from canvas size
  // const originRaw = useRef({ x: -1, y: -1 });

  // Transform matrix to represent pan (translate) and zoom (scale).
  // Default translate (0,0), zoom scale 1
  const transformMat = useRef(DEFAULT_TRANSFORM_MATRIX);
  // Used to check whether transformMat has changed
  const prevTransformMat = useRef<DOMMatrix | null>(null);

  // Translation speed in distance units per second
  const vel = useRef({ x: 0, y: 0 });

  // Coords of the mouse relative to the top-left of canvas,
  // raw ie before panzoom transformation
  const mouseCoords = useRef<Coords>({ x: -1, y: -1 });

  // Previous tile map position of the mouse cursor pointing at.
  // Used to determine whether the mouse cursor has moved to a new tile,
  // initialised implemented to avoid unnecessary collision detection on mouse
  // move.
  const prevMouseTileMapPos = useRef<Pos | null>(null);

  // Mainly for rendering an iso square perimeter around environment objects that
  // are being hovered over by the mouse cursor, or showing stats of villager
  // that is being hovered.
  const mouseCollidingObjects = useRef<Set<MapObjectId>>(new Set());

  // const [simState, setTileMap] = React.useState(TILE_MAP);
  // const simState = useRef<Map<CoordStr, CellJSON>>(
  //   new Map(
  //     Object.entries(WORLD_MAP.cells).filter(([k]) => isCoordStr(k)) as [
  //       CoordStr,
  //       CellJSON
  //     ][]
  //   )
  // );

  const simStateRef = useRef<SimulationState>();

  const tileMapRange = useRef<IRange>({
    minX: -20,
    maxX: 19,
    minY: -20,
    maxY: 19,
  });

  // Order to visit map tile positions to render objects so that front objects are rendered
  // on top of back objects
  const posRenderOrder = useRef<Pos[]>(
    calculateCoordsOrder(tileMapRange.current)
  );

  // const images = useRef<HTMLImageElement[]>(getTileImages());
  // Images for house, cosmetics, productions, villagers
  const assetsRef = useRef<Assets>();

  // Special objects: coin, energy, grass tile, etc.
  // const specialObjects = useRef<Map<string, SpecialObject>>(new Map());
  // const assets = useRef(new Map(ASSETS.map((asset) => [asset.id, asset])));
  const grassTileObject = useRef(
    new MapObject(
      grassTileImgPath,
      { x: 0, y: 0 }, // this position means nothing, will be updated every tim
      // grass field object is drawn
      // negative elevation, grass field goes below the ground
      -116,
      { dx: 10, dy: 10 }, // dimensions 10x10 tiles per grass field object
      null
    )
  );

  // All map objects including loaded HTMLImageElement:
  // house object, production object, cosmetic object, villagers
  // Second render layer above grass
  const mapObjects = useRef<Map<MapObjectId, MapObject>>(new Map());
  const posToObjects = useRef<Map<PosStr, MapObjectId[]>>(new Map());

  const handleReceiveAssets = useCallback((assets: Assets) => {
    assetsRef.current = assets;
  }, []);

  const handleReceiveSimulationState = useCallback(
    (simulationState: SimulationState) => {
      simStateRef.current = simulationState;

      tileMapRange.current = findRange(simStateRef.current.worldMap.cells);

      posRenderOrder.current = calculateCoordsOrder(tileMapRange.current);

      mapObjects.current.clear();
      posToObjects.current.clear();

      // === Update mapObjects and posToObjects ===
      // TODO: calculate diff between old and new SimulationState.enviroObjects
      // and SimulationState.villagers and only update mapObjects and posToObjects
      // with the difference. So that we don't reload the same images.
      for (
        let tileX = tileMapRange.current.minX;
        tileX <= tileMapRange.current.maxX;
        ++tileX
      ) {
        for (
          let tileY = tileMapRange.current.minY;
          tileY <= tileMapRange.current.maxY;
          ++tileY
        ) {
          const pos: Pos = { x: tileX, y: tileY };
          const posStr = serializePosStr(pos);
          const cell = simulationState.worldMap.cells.get(posStr);
          const enviroObjectId = cell?.object;
          const enviroObject =
            enviroObjectId && simulationState.enviroObjects.get(enviroObjectId);
          const asset =
            enviroObject &&
            enviroObject.asset !== null &&
            assetsRef.current?.get(enviroObject.asset);
          const finalRemoteImageUrl = asset && asset.remoteImages.at(-1)?.url;
          if (finalRemoteImageUrl) {
            const environObject: MapObject = new MapObject(
              finalRemoteImageUrl,
              pos,
              0,
              asset.dimensions,
              enviroObjectId
            );
            mapObjects.current.set(enviroObjectId, environObject);
            posToObjectsAdd(posToObjects.current, posStr, enviroObjectId);
          }
        }
      }

      for (let [villagerId, villager] of simulationState.villagers) {
        if (villager.position && villager.asset) {
          const asset = assetsRef.current?.get(villager.asset);
          if (asset !== undefined) {
            const finalRemoteImage = asset.remoteImages.at(-1);
            if (finalRemoteImage !== undefined) {
              const environObject: MapObject = new MapObject(
                finalRemoteImage.url,
                villager.position,
                0,
                asset.dimensions,
                villagerId
              );
              mapObjects.current.set(villagerId, environObject);
              posToObjectsAdd(
                posToObjects.current,
                serializePosStr(villager.position),
                villagerId
              );
            }
          } else {
            console.error(
              `Asset of villager with key ${villagerId} not found in assets`
            );
          }
        }
      }
    },
    []
  );

  handleReceiveAssets(deserializeJSONToMap(assets1, Asset.deserialize));

  // note: handleReceiveSimulationState depends on assets being initialised
  handleReceiveSimulationState(SimulationState.deserialize(simulationState1));

  const keyRef = useRef<IKeys>({
    left: false,
    up: false,
    right: false,
    down: false,
  });

  const mouseLeftIsDown = useRef(false);

  const selectedEnviroObject = useRef<EnviroObjectId | null>(null);

  // DOMHIghResTimeStamp is a double representing the time in milliseconds,
  // potentially accurate to one thousandth of a millisecond but at least
  // accurate 1 millisecond. Value 0 is a special case which requestAnimationFrame
  // will never pass to the callback function.
  const startTimestamp = useRef<DOMHighResTimeStamp>(0);
  const prevTimestamp = useRef<DOMHighResTimeStamp>(0);

  console.log("Render Map");

  const renderTiles = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    const canvasSize = canvas
      ? getCanvasSize(canvas)
      : { dx: window.innerWidth, dy: window.innerHeight };
    const originRaw = getOriginRaw(canvasSize);

    if (grassTileObject.current !== null) {
      for (let pos of posRenderOrder.current ?? []) {
        if (
          pos.x % grassTileObject.current.dimensions.dx === 0 &&
          pos.y % grassTileObject.current.dimensions.dy === 0
        ) {
          grassTileObject.current.updatePos(pos);
          grassTileObject.current.drawTile(ctx, originRaw);
        }
      }
    } else {
      console.error("Could render grass field: grass tile object is null");
    }

    // === Draw square grid ===
    for (
      let tileX = tileMapRange.current.minX;
      tileX <= tileMapRange.current.maxX;
      ++tileX
    ) {
      for (
        let tileY = tileMapRange.current.minY;
        tileY <= tileMapRange.current.maxY;
        ++tileY
      ) {
        const coordsRender = posToIsoCoords(originRaw, {
          x: tileX,
          y: tileY,
        });

        drawTileOutline(
          ctx,
          coordsRender,
          { dx: Tile.TILE_WIDTH, dy: Tile.TILE_HEIGHT },
          "rgba(255,255,255,0.4)",
          "rgba(25,34,44,0.08)"
        );
        if (DEBUG_MAP_VIS) {
          //     if (tileX % 2 === 0 && tileY % 2 === 0)
          //         drawSquare(
          //             ctx,
          //             { x: renderX, y: renderY - Tile.UNIT_HALF },
          //             {
          //                 width: Tile.TILE_WIDTH,
          //                 height: Tile.TILE_HEIGHT,
          //             },
          //             `rgba(128, 206, 242,0.8)`
          //         );
        }
      }
    }

    // === Draw map objects in iso projection back to front ===
    for (let pos of posRenderOrder.current) {
      const mapObjectIds = posToObjects.current.get(serializePosStr(pos)) ?? [];
      for (let mapObjectId of mapObjectIds) {
        if (mapObjectId) {
          const mapObject = mapObjects.current.get(mapObjectId);
          if (mapObject) {
            mapObject.drawTile(ctx, originRaw);
          }
        }
      }
    }

    // === Draw mouse cursor colliding object outlines ===
    for (let mouseCollidingObject of mouseCollidingObjects.current) {
      const mapObject = mapObjects.current.get(mouseCollidingObject);
      if (mapObject) {
        // Note: assumes mapObject.dimensions.dx and mapObject.dimensions.dy are
        // same value ie mapObject is square. Shouldnt matter which you use.
        const centerCoord = posToIsoCoords(originRaw, mapObject.pos);
        const outlineMidTopCoord = {
          x: centerCoord.x,
          // Center coord y minus half of the diagonal length of the object
          y:
            centerCoord.y -
            Math.floor(mapObject.dimensions.dy / 2) * Tile.TILE_HEIGHT,
        };

        drawTileOutline(
          ctx,
          outlineMidTopCoord,
          {
            dx: mapObject.dimensions.dx * Tile.TILE_WIDTH,
            dy: mapObject.dimensions.dy * Tile.TILE_HEIGHT,
          },
          "rgba(247, 217, 22, 0.7)",
          "rgba(0,0,0,0)",
          5,
          []
        );
      }
    }

    // === Draw mouse hover tile ===
    drawPoint(ctx, originRaw, "rgba(23, 23, 23,0.5)", 5);

    const mouseTransformed = getTransformedPoint(
      transformMat.current,
      mouseCoords.current
    );

    // drawPoint(ctx, mouseRaw.current, "orange");
    drawPoint(ctx, mouseTransformed, "lavender", 5);

    const hoverTilePos = inputCoordsToTileMapPos(originRaw, mouseTransformed);

    if (
      simStateRef.current?.worldMap.cells.has(serializePosStr(hoverTilePos))
    ) {
      if (DEBUG1) {
        console.log(`Hovering over tile ${hoverTilePos.x}, ${hoverTilePos.y}`);
      }
      const hoverTileRenderCoords = posToIsoCoords(originRaw, hoverTilePos);
      renderTileHover(ctx, hoverTileRenderCoords.x, hoverTileRenderCoords.y);
    }
  }, []);

  const renderBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const canvasSize: Dimensions = canvas
      ? getCanvasSize(canvas)
      : { dx: window.innerWidth, dy: window.innerHeight };

    // Can/Should change the color once UI design is determined
    ctx.fillStyle = "#151d26";

    // If render background using canvas width and height, must
    // reset canvase transformation matrix to normal before rendering.
    ctx.fillRect(0, 0, canvasSize.dx, canvasSize.dy);

    // ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }, []);

  const render = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (DEBUG1) console.log(`Render`);

      // const offsetX = Tile.TILE_WIDTH / 2;
      // const offsetY = Tile.TILE_HEIGHT;

      // minus offsetX and offsetY so that tile (0,0) is at center of
      // canvas assuming no transformations
      // const tileStartX = canvasSize.width / 2 - offsetX;
      // MAGIC_NUMBER_TO_ADJUST is to adjust position when calling Tile.drawTile()
      // const tileStartY =
      //     canvasSize.height / 2 - offsetY - MAGIC_NUMBER_TO_ADJUST;

      // Save normal transformation matrix (done in useEffect prior
      // to starting rendering loop)
      // ctx.setTransform(DOMMatrix.fromMatrix(DEFAULT_ZOOM_MATRIX));
      ctx.save();
      renderBackground(ctx);

      ctx.setTransform(transformMat.current);
      renderTiles(ctx);
      ctx.restore();
    },
    [renderBackground, renderTiles]
  );

  const onScrollY = useCallback(
    (ctx: CanvasRenderingContext2D, e: WheelEvent) => {
      // const currentScale = ctx.getTransform().a;
      const currentScale = transformMat.current.a;
      const zoomAmount = -e.deltaY * ZOOM_SENSITIVITY;

      const transformedCursor = getTransformedPoint(
        transformMat.current,
        mouseCoords.current
      );

      // When reaching MAX_SCALE, it only allows zoom OUT (= negative zoomAmount)
      if (currentScale >= MAX_SCALE && zoomAmount > 0) return; // prevent zoom in
      // When reaching MIN_SCALE, it only allows zoom IN (= positive zoomAmount)
      if (currentScale <= MIN_SCALE && zoomAmount < 0) return; // prevent zom out

      const scale = DEFAULT_MAP_SCALE + zoomAmount;

      // === Declarative method of rendering map zoom ===
      transformMat.current.scaleSelf(
        scale,
        scale,
        0,
        transformedCursor.x,
        transformedCursor.y
      );

      // Above equivalent to below
      // transformMat.current.translateSelf(
      // 	transformedCursor.x,
      // 	transformedCursor.y
      // );
      // transformMat.current.scaleSelf(scale, scale);
      // transformMat.current.translateSelf(
      // 	-transformedCursor.x,
      // 	-transformedCursor.y
      // );

      // === Imperative method of rendering map zoom ===
      // ctx.translate(e.offsetX, e.offsetY);
      // ctx.scale(scale, scale);
      // ctx.translate(-e.offsetX, -e.offsetY);

      // console.log({
      // 	currentScale,
      // 	zoomAmount,
      // 	scale,
      // 	offsetX: e.offsetX,
      // 	offsetY: e.offsetY,
      // 	deltaY: e.deltaY,
      // });
    },
    []
  );

  const onWheel = useCallback(
    (ctx: CanvasRenderingContext2D, e: WheelEvent) => {
      onScrollY(ctx, e);
    },
    [onScrollY]
  );

  const onMouseMove = useCallback(
    (ctx: CanvasRenderingContext2D, e: MouseEvent) => {
      const rect = ctx.canvas.getBoundingClientRect();

      mouseCoords.current = {
        x: e.clientX - rect.x,
        y: e.clientY - rect.y,
      };

      const mouseCoordsTransformed = getTransformedPoint(
        transformMat.current,
        mouseCoords.current
      );
      const mouseTileMapPos = inputCoordsToTileMapPos(
        getOriginRaw(getCanvasSize(ctx.canvas)),
        mouseCoordsTransformed
      );

      if (
        mouseTileMapPos.x === prevMouseTileMapPos.current?.x &&
        mouseTileMapPos.y === prevMouseTileMapPos.current?.y
      ) {
      }
      // Mouse cursor might have moved, but still on the same tile
      else {
        // Mouse cursor has moved to a new tile
        mouseCollidingObjects.current = getCollidingObjects(
          mouseTileMapPos,
          mapObjects.current
        );
      }

      if (selectedEnviroObject.current !== null) {
        // === Move selected environment object with mouse movement ===
        // Map object of the selected environment object
        const mapObject = mapObjects.current.get(selectedEnviroObject.current);
        if (mapObject !== undefined) {
          const prevSelectedObjectPos = { ...mapObject.pos };
          mapObject.updatePos(mouseTileMapPos);
          posToObjectsUpdate(
            posToObjects.current,
            selectedEnviroObject.current,
            serializePosStr(prevSelectedObjectPos),
            serializePosStr(mouseTileMapPos)
          );
        }
      } else if (mouseLeftIsDown.current) {
        // Drag map using mouse. Add mouse movement to transform matrix
        const displacement = {
          x: e.movementX,
          y: e.movementY,
        };
        transformMat.current.translateSelf(
          displacement.x / transformMat.current.a,
          displacement.y / transformMat.current.a
        );
      }

      prevMouseTileMapPos.current = { ...mouseTileMapPos };
    },
    []
  );

  const onMouseDown = useCallback(
    (ctx: CanvasRenderingContext2D, e: MouseEvent) => {
      const originRaw = getOriginRaw(getCanvasSize(ctx.canvas));
      const mouseTransformed = getTransformedPoint(
        transformMat.current,
        mouseCoords.current
      );
      const clickedTileCoords = inputCoordsToTileMapPos(
        originRaw,
        mouseTransformed
      );

      if (
        simStateRef.current?.worldMap.cells.has(
          serializePosStr(clickedTileCoords)
        )
      ) {
        const cell = simStateRef.current.worldMap.cells.get(
          serializePosStr(clickedTileCoords)
        );
        if (cell !== undefined) {
          if (cell.object === null) {
            // Mouse down on an empty grass tile
            console.log(
              `Mouse down on empty grass tile at ${clickedTileCoords.x}, ${clickedTileCoords.y}`
            );
            mouseLeftIsDown.current = true;
          }
        }
      }
    },
    []
  );

  const onMouseUp = useCallback(
    (ctx: CanvasRenderingContext2D, e: MouseEvent) => {
      mouseLeftIsDown.current = false;
    },
    []
  );

  const onClick = useCallback(
    (ctx: CanvasRenderingContext2D, e: MouseEvent) => {
      const originRaw = getOriginRaw(getCanvasSize(ctx.canvas));
      const mouseCoordsTransformed = getTransformedPoint(
        transformMat.current,
        mouseCoords.current
      );

      // drawPoint(ctx, mouseRaw.current, "violet");
      drawPoint(ctx, mouseCoordsTransformed, "beige");

      const clickedTileMapPos = inputCoordsToTileMapPos(
        originRaw,
        mouseCoordsTransformed
      );

      const clickedCell = simStateRef.current?.worldMap.cells.get(
        serializePosStr(clickedTileMapPos)
      );
      if (clickedCell) {
        console.log(
          `Clicked tile ${clickedTileMapPos.x}, ${clickedTileMapPos.y}`
        );
        if (selectedEnviroObject.current !== null) {
          // Place down environment object wherever user clicked
          // TODO: Need to validate the place down position
          if (
            // cell to place enviro object down is empty
            clickedCell.object === null &&
            // Only collidign object is the current selected object. Note that
            // the mouse might be "ahead" of the dragged position of the object,
            // in which case the mouse cursor is not colliding with the object
            // it is dragging. Thus check size === 0 too.
            mouseCollidingObjects.current.size <= 1
          ) {
            // Place down object
            clickedCell.object = selectedEnviroObject.current;
            const mapObject = mapObjects.current.get(
              selectedEnviroObject.current
            );
            if (mapObject !== undefined) {
              console.log(
                `Place down EnviroObject ${selectedEnviroObject.current} at ${clickedTileMapPos.x}, ${clickedTileMapPos.y}`
              );

              const prevMapObjectPos = { ...mapObject.pos };
              mapObject.updatePos(clickedTileMapPos);
              // posToObjects.current.delete(serializePosStr(prevMapObjectPos));
              // posToObjects.current
              //   .get(serializePosStr(clickedTileCoords))
              //   ?.push(selectedEnviroObject.current);
              posToObjectsUpdate(
                posToObjects.current,
                selectedEnviroObject.current,
                serializePosStr(prevMapObjectPos),
                serializePosStr(clickedTileMapPos)
              );
            }
            // TODO: Send this change to simserver
            selectedEnviroObject.current = null;
          }
        } else {
          const clickedTileRenderCoords = posToIsoCoords(
            originRaw,
            clickedTileMapPos
          );
          // do smthn with the clicked tile

          // Tile exists
          if (mouseCollidingObjects.current.size > 0) {
            // Set selected environment object to the first object that the
            // mouse cursor is colliding with
            for (let collidingObject of mouseCollidingObjects.current.values()) {
              // Make sure the object is an environment object, not a villager
              console.log(
                `Mouse click collided with MapObjectId:`,
                collidingObject
              );

              if (simStateRef.current?.enviroObjects.has(collidingObject)) {
                console.log(`Selected MapObjectId`, collidingObject);
                selectedEnviroObject.current = collidingObject;
                break;
              }
            }
            if (selectedEnviroObject.current !== null) {
              const mapObject = mapObjects.current.get(
                selectedEnviroObject.current
              );
              if (mapObject) {
                // === Remove objectId from simstate cell ===
                const cellOfEnviroObject =
                  simStateRef.current?.worldMap.cells.get(
                    serializePosStr(mapObject.pos)
                  );
                if (cellOfEnviroObject) {
                  // Update simState cell object to null
                  cellOfEnviroObject.object = null;
                }
                // === Update map object pos to clicked tile (teleport to mouse) ===
                const prevSelectedObjectPos = { ...mapObject.pos };
                mapObject.updatePos(clickedTileMapPos);
                posToObjectsUpdate(
                  posToObjects.current,
                  selectedEnviroObject.current,
                  serializePosStr(prevSelectedObjectPos),
                  serializePosStr(clickedTileMapPos)
                );
              }
            }
          }
        }
      }
    },
    []
  );

  const update = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      elapsed: DOMHighResTimeStamp,
      delta: DOMHighResTimeStamp
    ) => {
      if (keyRef.current.left) {
        vel.current.x += ACCEL;
      }
      if (keyRef.current.right) {
        vel.current.x -= ACCEL;
      }
      if (!keyRef.current.left && !keyRef.current.right) {
        vel.current.x *= VEL_DAMPER;
      }
      if (Math.abs(vel.current.x) > MAX_VEL) {
        vel.current.x = getSign(vel.current.x) * MAX_VEL;
      } else if (Math.abs(vel.current.x) < MIN_VEL) {
        vel.current.x = 0;
      }

      if (keyRef.current.up) {
        vel.current.y += ACCEL;
      }
      if (keyRef.current.down) {
        vel.current.y -= ACCEL;
      }
      if (!keyRef.current.up && !keyRef.current.down) {
        vel.current.y *= VEL_DAMPER;
      }
      if (Math.abs(vel.current.y) > MAX_VEL) {
        vel.current.y = getSign(vel.current.y) * MAX_VEL;
      } else if (Math.abs(vel.current.y) < MIN_VEL) {
        vel.current.y = 0;
      }

      const displacement = {
        x: vel.current.x * delta,
        y: vel.current.y * delta,
      };
      transformMat.current.translateSelf(displacement.x, displacement.y);
    },
    []
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Save current transformation matrix (normal). Will be restored after
    // rendering tiles each draw cycle to draw background properly.
    context.save();

    console.log("Canvas useEffect");

    const handleWheel = (e: WheelEvent) => onWheel(context, e);
    const handleMouseMouve = (e: MouseEvent) => onMouseMove(context, e);
    const handleClick = (e: MouseEvent) => onClick(context, e);
    const handleMouseDown = (e: MouseEvent) => onMouseDown(context, e);
    const handleMouseUp = (e: MouseEvent) => onMouseUp(context, e);

    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleMouseMouve);
    canvas.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    // TODO call these handles on receive ws event from simserver
    handleReceiveAssets(deserializeJSONToMap(assets1, Asset.deserialize));
    handleReceiveSimulationState(SimulationState.deserialize(simulationState1));

    // let animationFrameId: number
    const draw = (timestamp: DOMHighResTimeStamp) => {
      if (startTimestamp.current === 0) {
        startTimestamp.current = timestamp;
        prevTimestamp.current = timestamp;
      }
      const elapsed = timestamp - startTimestamp.current;
      const delta = timestamp - prevTimestamp.current;
      update(context, elapsed, delta);
      render(context);

      if (FRAME_LIMIT === -1 || frameCount.current < FRAME_LIMIT) {
        requestAnimationFrame(draw);
        frameCount.current += 1;
      }

      prevTimestamp.current = timestamp;
      // create copy
      prevTransformMat.current = DOMMatrix.fromMatrix(transformMat.current);
      // animationFrameId = requestAnimationFrame(draw)
    };

    if (FRAME_LIMIT != 0) {
      // -1 or >0
      draw(performance.now());
    }

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleMouseMouve);
      canvas.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);

      // TODO: Fix flickering when calling cancelAnimationFrame
      // This might help: https://stackoverflow.com/questions/40265707/flickering-images-in-canvas-animation
      // cancelAnimationFrame(animationFrameId)
    };
  }, [render, onWheel, onMouseMove, onClick]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
      if (canvasRef.current !== null) {
        const canvasSize: Dimensions = {
          dx: canvasRef.current.width,
          dy: canvasRef.current.height,
        };
        const originRaw = getOriginRaw(canvasSize);
        // Do smthn with updated originRaw
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    console.log(`Attached resize event listener to window`);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        console.log(`left down`);

        keyRef.current.right = false;
        keyRef.current.left = true;
        e.preventDefault();
      } else if (e.code === "ArrowUp") {
        keyRef.current.down = false;
        keyRef.current.up = true;
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        keyRef.current.left = false;
        keyRef.current.right = true;
        e.preventDefault();
      } else if (e.code === "ArrowDown") {
        keyRef.current.up = false;
        keyRef.current.down = true;
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        console.log(`left up`);

        keyRef.current.left = false;
        e.preventDefault();
      } else if (e.code === "ArrowUp") {
        keyRef.current.up = false;
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        keyRef.current.right = false;
        e.preventDefault();
      } else if (e.code === "ArrowDown") {
        keyRef.current.down = false;
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
    console.log(`Attached keydown and keyup event listeners to document`);
  }, []);

  return (
    <>
      <WSBox />
      <canvas ref={canvasRef} />
    </>
  );
};

export default WorldMap;

/**
 * @param context canvas context 2d
 * @param initPoint mouse/touch input position x (ie. clientX, clientY)
 * @returns {x, y} x and y position of inputX/Y which map scale and position are taken into account
 */
export const getTransformedPoint = (
  // context: CanvasRenderingContext2D,
  transform: DOMMatrix,
  initPoint: Coords
) => {
  // const transform = context.getTransform();
  const invertedScaleX = DEFAULT_MAP_SCALE / transform.a;
  const invertedScaleY = DEFAULT_MAP_SCALE / transform.d;

  const transformedX =
    invertedScaleX * initPoint.x - invertedScaleX * transform.e;
  const transformedY =
    invertedScaleY * initPoint.y - invertedScaleY * transform.f;

  return { x: transformedX, y: transformedY };
};

/**
 * @param originCoords position where map start rendered (Position2D has {x: number, y: number} type)
 * @param inputCoords mouse/touch input coordinate on screen, after transforms ie. getTransformedpoint(clientX-rect.left, clientY-rect.top, transformMat)
 * @returns positionX, positionY: tile position x, y axis
 */
const inputCoordsToTileMapPos = (
  originCoords: Coords,
  inputCoords: Coords
): Pos => {
  return {
    x: Math.floor(
      (inputCoords.y - originCoords.y) / Tile.TILE_HEIGHT +
        (inputCoords.x - originCoords.x) / Tile.TILE_WIDTH
    ),
    y: Math.floor(
      (inputCoords.y - originCoords.y) / Tile.TILE_HEIGHT -
        (inputCoords.x - originCoords.x) / Tile.TILE_WIDTH
    ),
  };
};

const getSign = (value: number) => (value >= 0 ? 1 : -1);

const findRange = (cells: Cells): IRange => {
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  for (const coordStr of cells.keys()) {
    const { x, y } = parsePosStr(coordStr);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY };
};

const getCanvasSize = (canvas: HTMLCanvasElement): Dimensions => {
  return {
    dx: canvas.width,
    dy: canvas.height,
  };
};

const getOriginRaw = (canvasSize: Dimensions): Coords => {
  return {
    x: canvasSize.dx / 2 - Tile.TILE_WIDTH / 2,
    y: canvasSize.dy / 2 - Tile.TILE_HEIGHT - MAGIC_NUMBER_TO_ADJUST,
  };
};

export const drawPoint = (
  ctx: CanvasRenderingContext2D,
  point: Coords,
  color: string,
  radius: number = 10
) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath(); // Start a new path
  ctx.arc(point.x - radius / 2, point.y - radius / 2, radius, 0, 2 * Math.PI);
  ctx.fill(); // Fill the circle
  ctx.restore();
};

const checkTransformMatChanged = (
  prevTransformMat: DOMMatrix | null,
  transformMat: DOMMatrix
) => {
  if (prevTransformMat === null) return true;
  return (
    prevTransformMat.a !== transformMat.a ||
    prevTransformMat.b !== transformMat.b ||
    prevTransformMat.c !== transformMat.c ||
    prevTransformMat.d !== transformMat.d ||
    prevTransformMat.e !== transformMat.e ||
    prevTransformMat.f !== transformMat.f
  );
};

const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = "gray",
  lineWidth = 1,
  lineDash = []
) => {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(lineDash);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash to solid line
  ctx.restore();
};

/**
 * Draw tile using pos as middle-top corner of projected bounding box,
 * bc it is the x-y corner of the tile in tile map view.
 */
const drawTileOutline = (
  ctx: CanvasRenderingContext2D,
  coords: Coords,
  dim: Dimensions,
  lineColor = "rgba(255,255,255,0.4)",
  fillStyle = "rgba(25,34, 44,0.2)",
  lineWidth = 1,
  lineDash = [5, 2]
) => {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash(lineDash);
  ctx.strokeStyle = lineColor;
  ctx.fillStyle = fillStyle;
  ctx.lineWidth = lineWidth;
  ctx.moveTo(coords.x, coords.y); // top-middle of projected bounding box
  ctx.lineTo(coords.x + dim.dx / 2, coords.y + dim.dy / 2); // right-middle of projected bounding box
  ctx.lineTo(coords.x, coords.y + dim.dy); // bottom-middle of projected bounding box
  ctx.lineTo(coords.x - dim.dx / 2, coords.y + dim.dy / 2); // left-middle of projected bounding box
  ctx.lineTo(coords.x, coords.y);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
};

const renderTileHover = (
  ctx: CanvasRenderingContext2D,
  isoX: number,
  isoY: number
) => {
  drawTileOutline(
    ctx,
    { x: isoX, y: isoY },
    { dx: Tile.TILE_WIDTH, dy: Tile.TILE_HEIGHT },
    "rgba(11, 94, 184, 0.8)",
    "rgba(22, 219, 245, 0.4)",
    2,
    []
  );
};

export const drawSquare = (
  ctx: CanvasRenderingContext2D,
  pos: Coords,
  dim: Dimensions,
  lineColor = "rgba(255,255,255,0.4)",
  lineWidth = 1
) => {
  ctx.save();
  ctx.beginPath();
  // ctx.setLineDash([5, 2]);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.rect(
    pos.x - lineWidth,
    pos.y - lineWidth,
    dim.dx + lineWidth,
    dim.dy + lineWidth
  );
  ctx.stroke();
  ctx.restore();
};

const calculateCoordsOrder = (coordsRange: IRange): Coordinates[] => {
  const coordsOrder: Coords[] = [];
  const minX = coordsRange.minX;
  const minY = coordsRange.minY;
  const maxX = coordsRange.maxX;
  const maxY = coordsRange.maxY;
  for (let startY = minY; startY <= maxY; ++startY) {
    let curX = minX;
    let curY = startY;
    while (curY >= minY && curX <= maxX) {
      coordsOrder.push({ x: curX, y: curY });
      curX += 1;
      curY -= 1;
    }
  }
  for (let startX = minX; startX <= maxX; ++startX) {
    let curX = startX;
    let curY = maxY;
    while (curX <= maxX && curY >= minY) {
      coordsOrder.push({ x: curX, y: curY });
      curX += 1;
      curY -= 1;
    }
  }
  return coordsOrder;
};

export const posToIsoCoords = (
  originCoords: Coords,
  pos: Coordinates
): Coords => {
  return {
    x: originCoords.x + (pos.x - pos.y) * Tile.TILE_HALF_WIDTH,
    y: originCoords.y + (pos.x + pos.y) * Tile.TILE_HALF_HEIGHT,
  };
};

const posToObjectsAdd = (
  posToObjects: Map<PosStr, string[]>,
  pos: PosStr,
  mapObjectId: MapObjectId
) => {
  if (!posToObjects.has(pos)) {
    posToObjects.set(pos, []);
  }

  posToObjects.get(pos)?.push(mapObjectId);
};

const posToObjectsUpdate = (
  posToObjects: Map<PosStr, string[]>,
  mapObjectId: MapObjectId,
  oldPosStr: PosStr,
  newPosStr: PosStr
) => {
  if (posToObjects.has(oldPosStr)) {
    const mapObjectIds = posToObjects.get(oldPosStr);
    if (mapObjectIds !== undefined) {
      const idx = mapObjectIds.indexOf(mapObjectId);
      if (idx >= 0) {
        mapObjectIds.splice(idx, 1);
        posToObjectsAdd(posToObjects, newPosStr, mapObjectId);
      }
    }
  }
};

const pointInBounds = (point: Pos, objPos: Pos, objDim: Dimensions) => {
  return (
    point.x >= objPos.x - Math.floor(objDim.dx / 2) &&
    point.x < objPos.x + Math.ceil(objDim.dx / 2) &&
    point.y >= objPos.y - Math.floor(objDim.dy / 2) &&
    point.y < objPos.y + Math.ceil(objDim.dy / 2)
  );
};

const DEDUB_COLLISIONS = false;
/**
 *
 * @param mousePos Tile map position of point to check colliding e.g. (3, 4)
 * @param mapObjects
 */
const getCollidingObjects = (
  pos: Pos,
  mapObjects: Map<MapObjectId, MapObject>
) => {
  if (DEDUB_COLLISIONS) {
    console.log(`Find colliding objects with pos ${pos.x}, ${pos.y}`);
  }
  const collidingObjects = Array.from(mapObjects.entries())
    .filter(
      ([posStr, mapObject]) =>
        mapObject.objectId !== null &&
        pointInBounds(pos, mapObject.pos, mapObject.dimensions)
    )
    .map(([posStr, mapObject]) => mapObject.objectId)
    .filter((id): id is string => id !== null);

  if (DEDUB_COLLISIONS) {
    console.log("Colliding objects found:", collidingObjects);
  }
  return new Set(collidingObjects);
};
