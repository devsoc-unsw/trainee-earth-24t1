"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialItem = exports.ProductionObject = exports.isProductionObjectJSON = exports.AttributeValue = exports.Attribute = exports.Resource = exports.buyPref = exports.resourceOrigin = exports.Villager = exports.VILLAGER_TYPES_ARRAY = exports.isHouseObjectJSON = exports.HouseObject = exports.isCosmeticObjectJSON = exports.CosmeticObject = exports.EnviroObject = exports.EnviroObjectType = exports.Cell = exports.WorldMap = exports.clearGridCells = exports.clearGridCellsJSON = exports.fillGridCells = exports.fillGridCellsJSON = exports.checkGridCells = exports.checkGridCellsJSON = exports.parsePosStr = exports.serializePosStr = exports.isPosStr = exports.SimulationState = void 0;
var objectTyping_ts_1 = require("@backend/utils/objectTyping.ts");
// import { IWorldMapDocument } from "@backend/types/databaseTypes.ts";
var createId_ts_1 = require("@backend/utils/createId.ts");
var SimulationState = /** @class */ (function () {
    function SimulationState(worldMap, villagers, attributes, enviroObjects, resources, _id) {
        if (worldMap === void 0) { worldMap = new WorldMap(); }
        if (villagers === void 0) { villagers = new Map(); }
        if (attributes === void 0) { attributes = new Map(); }
        if (enviroObjects === void 0) { enviroObjects = new Map(); }
        if (resources === void 0) { resources = new Map(); }
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        this.transactions = [];
        this._id = _id;
        this.worldMap = worldMap;
        this.villagers = villagers;
        this.attributes = attributes;
        this.enviroObjects = enviroObjects;
        this.resources = resources;
    }
    SimulationState.prototype.show = function () {
        console.log('\n\n=== SimulationState: ===');
        console.dir(this.serialize(), { depth: null });
    };
    SimulationState.prototype.serialize = function () {
        return {
            _id: this._id,
            worldMap: this.worldMap.serialize(),
            villagers: (0, objectTyping_ts_1.serializeMapToJSON)(this.villagers),
            attributes: (0, objectTyping_ts_1.serializeMapToJSON)(this.attributes),
            enviroObjects: (0, objectTyping_ts_1.serializeMapToJSON)(this.enviroObjects),
            resources: (0, objectTyping_ts_1.serializeMapToJSON)(this.resources),
        };
    };
    SimulationState.deserialize = function (obj) {
        var state = new SimulationState(WorldMap.deserialize(obj.worldMap), (0, objectTyping_ts_1.deserializeJSONToMap)(obj.villagers, Villager.deserialize), (0, objectTyping_ts_1.deserializeJSONToMap)(obj.attributes, Attribute.deserialize), (0, objectTyping_ts_1.deserializeJSONToMap)(obj.enviroObjects, EnviroObject.deserialize), (0, objectTyping_ts_1.deserializeJSONToMap)(obj.resources, Resource.deserialize), obj._id);
        return state;
    };
    return SimulationState;
}());
exports.SimulationState = SimulationState;
var isPosStr = function (str) {
    return /^-?\d+,-?\d+$/.test(str);
};
exports.isPosStr = isPosStr;
// expects x and y to be integers
var serializePosStr = function (_a) {
    var x = _a.x, y = _a.y;
    return "".concat(x, ",").concat(y);
};
exports.serializePosStr = serializePosStr;
var parsePosStr = function (coordStr) {
    var _a = coordStr.split(',').map(function (str) { return parseInt(str); }), x = _a[0], y = _a[1];
    return { x: x, y: y };
};
exports.parsePosStr = parsePosStr;
/**
 * Check grid centered at pos with dim:
 * - within bounds
 * - completely overlaps with EnviroObjectId (null for empty tiles) if checkObject is true
 * - completely owned by owner (null for no owner) if checkOwner is true
 */
var checkGridCellsJSON = function (cells, pos, dim, object, checkObject, owner, checkOwner) {
    for (var x = pos.x - Math.floor(dim.dx / 2); x < pos.x + Math.ceil(dim.dx / 2); x++) {
        for (var y = pos.y - Math.floor(dim.dy / 2); y < pos.y + Math.ceil(dim.dy / 2); y++) {
            var curPos = { x: x, y: y };
            var curPosStr = (0, exports.serializePosStr)(curPos);
            if (!cells[curPosStr] ||
                (checkObject && cells[curPosStr].object !== object) ||
                (checkOwner && cells[curPosStr].owner !== owner)) {
                return false;
            }
        }
    }
    return true;
};
exports.checkGridCellsJSON = checkGridCellsJSON;
var checkGridCells = function (cells, pos, dim, objects, checkObject, owner, checkOwner) {
    for (var x = pos.x - Math.floor(dim.dx / 2); x < pos.x + Math.ceil(dim.dx / 2); x++) {
        for (var y = pos.y - Math.floor(dim.dy / 2); y < pos.y + Math.ceil(dim.dy / 2); y++) {
            var curPos = { x: x, y: y };
            var curPosStr = (0, exports.serializePosStr)(curPos);
            if (!cells.get(curPosStr) ||
                // @ts-ignore
                (checkObject && !objects.includes(cells.get(curPosStr).object)) ||
                // @ts-ignore
                (checkOwner && cells.get(curPosStr).owner !== owner)) {
                return false;
            }
        }
    }
    return true;
};
exports.checkGridCells = checkGridCells;
// Fill grid of cells centered at pos, with dimensions x,y, with the object
var fillGridCellsJSON = function (cells, pos, dim, object, setObject, owner, setOwner) {
    for (var x = pos.x - Math.floor(dim.dx / 2); x < pos.x + Math.ceil(dim.dx / 2); x++) {
        for (var y = pos.y - Math.floor(dim.dy / 2); y < pos.y + Math.ceil(dim.dy / 2); y++) {
            var curPos = { x: x, y: y };
            var curPosStr = (0, exports.serializePosStr)(curPos);
            if (setObject) {
                cells[curPosStr].object = object;
            }
            if (setOwner) {
                cells[curPosStr].owner = owner;
            }
        }
    }
};
exports.fillGridCellsJSON = fillGridCellsJSON;
var fillGridCells = function (cells, pos, dim, object, setObject, owner, setOwner) {
    for (var x = pos.x - Math.floor(dim.dx / 2); x < pos.x + Math.ceil(dim.dx / 2); x++) {
        for (var y = pos.y - Math.floor(dim.dy / 2); y < pos.y + Math.ceil(dim.dy / 2); y++) {
            var curPos = { x: x, y: y };
            var curPosStr = (0, exports.serializePosStr)(curPos);
            if (setOwner) {
                // @ts-ignore
                cells.get(curPosStr).owner = owner;
            }
            if (setObject) {
                // @ts-ignore
                cells.get(curPosStr).object = object;
            }
        }
    }
};
exports.fillGridCells = fillGridCells;
// Oposite of fillCellsGrid
var clearGridCellsJSON = function (cells, pos, dim, clearObject, clearOwner) {
    (0, exports.fillGridCellsJSON)(cells, pos, dim, null, clearObject, null, clearOwner);
};
exports.clearGridCellsJSON = clearGridCellsJSON;
var clearGridCells = function (cells, pos, dim, clearObject, clearOwner) {
    (0, exports.fillGridCells)(cells, pos, dim, null, clearObject, null, clearOwner);
};
exports.clearGridCells = clearGridCells;
var WorldMap = /** @class */ (function () {
    function WorldMap(cells) {
        if (cells === void 0) { cells = new Map(); }
        this.cells = new Map();
        this.cells = cells;
    }
    WorldMap.prototype.addCell = function (coordStr, cell) {
        this.cells.set(coordStr, cell);
    };
    WorldMap.prototype.serialize = function () {
        return {
            cells: (0, objectTyping_ts_1.serializeMapToJSON)(this.cells),
        };
    };
    WorldMap.deserialize = function (obj) {
        return new WorldMap((0, objectTyping_ts_1.deserializeJSONToMap)(obj.cells, Cell.deserialize));
    };
    return WorldMap;
}());
exports.WorldMap = WorldMap;
var Cell = /** @class */ (function () {
    function Cell(coordinates) {
        /**
         * VillagerId if the cell is owned by a villager. null if the cell is
         * not owned by any villager.
         */
        this.owner = null;
        /**
         * 1. EnviroObject if the cell is occupied by an environment object. Note
         *    multiple cells can be occupied by the same object.
         * 2. null if the cell is unoccupied (just plain grass)
         *
         * Deprecated case: EnviroObjectRef if the cell is occupied by an environment
         *    object but is not the primary cell responsible for storing the object's
         *    info.
         */
        this.object = null;
        this.coordinates = __assign({}, coordinates);
    }
    Cell.prototype.serialize = function () {
        return {
            pos: this.coordinates,
            owner: this.owner,
            object: this.object,
        };
    };
    Cell.deserialize = function (obj) {
        // @ts-ignore
        var cell = new Cell(__assign({}, obj.pos));
        cell.owner = obj.owner;
        cell.object = obj.object;
        return cell;
    };
    return Cell;
}());
exports.Cell = Cell;
function isEnviroObjectJSON(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        '_id' in obj &&
        typeof obj._id === 'string' &&
        'name' in obj &&
        typeof obj.name === 'string');
}
var EnviroObjectType;
(function (EnviroObjectType) {
    EnviroObjectType["HOUSE"] = "HOUSE";
    EnviroObjectType["COSMETIC"] = "COSMETIC";
    EnviroObjectType["PRODUCTION"] = "PRODUCTION";
})(EnviroObjectType || (exports.EnviroObjectType = EnviroObjectType = {}));
/**
 * @deprecated User EnviroObjectId instead.
 *
 * Used for cells that are occupied by an environment object by do not directly
 * own the information about the object. Reference the object by its id.
 *
 */
// type EnviroObjectRef = EnviroObjectId;
var EnviroObject = /** @class */ (function () {
    function EnviroObject(name, _id, asset, pos, enviroType) {
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        if (asset === void 0) { asset = null; }
        if (pos === void 0) { pos = null; }
        this.name = name;
        this._id = _id;
        this.asset = asset;
        this.pos = pos;
        this.enviroType = enviroType;
    }
    EnviroObject.prototype.serialize = function () {
        return {
            _id: this._id,
            name: this.name,
            asset: this.asset,
            pos: this.pos,
            enviroType: this.enviroType,
        };
    };
    EnviroObject.deserialize = function (obj) {
        return new EnviroObject(obj.name, obj._id, obj.asset, obj.pos, obj.enviroType);
    };
    return EnviroObject;
}());
exports.EnviroObject = EnviroObject;
var CosmeticObject = /** @class */ (function (_super) {
    __extends(CosmeticObject, _super);
    function CosmeticObject(name, owner, _id, asset, pos) {
        if (owner === void 0) { owner = null; }
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        if (asset === void 0) { asset = null; }
        if (pos === void 0) { pos = null; }
        var _this = _super.call(this, name, _id, asset, pos, EnviroObjectType.COSMETIC) || this;
        _this.owner = null;
        _this.owner = owner;
        return _this;
    }
    CosmeticObject.prototype.serialize = function () {
        return __assign(__assign({}, _super.prototype.serialize.call(this)), { owner: this.owner });
    };
    CosmeticObject.deserialize = function (obj) {
        return new CosmeticObject(obj.name, obj.owner, obj._id, obj.asset, obj.pos);
    };
    return CosmeticObject;
}(EnviroObject));
exports.CosmeticObject = CosmeticObject;
var isCosmeticObjectJSON = function (obj) {
    return (isEnviroObjectJSON(obj) && obj.enviroType === EnviroObjectType.COSMETIC);
};
exports.isCosmeticObjectJSON = isCosmeticObjectJSON;
var HouseObject = /** @class */ (function (_super) {
    __extends(HouseObject, _super);
    function HouseObject(name, owner, _id, asset) {
        if (owner === void 0) { owner = null; }
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        if (asset === void 0) { asset = null; }
        var _this = _super.call(this, name, _id, asset, null, EnviroObjectType.HOUSE) || this;
        _this.owner = null;
        _this.owner = owner;
        return _this;
    }
    HouseObject.prototype.serialize = function () {
        return __assign(__assign({}, _super.prototype.serialize.call(this)), { owner: this.owner });
    };
    HouseObject.deserialize = function (obj) {
        return new HouseObject(obj.name, obj.owner, obj._id, obj.asset);
    };
    return HouseObject;
}(EnviroObject));
exports.HouseObject = HouseObject;
var isHouseObjectJSON = function (obj) {
    return isEnviroObjectJSON(obj) && obj.enviroType === EnviroObjectType.HOUSE;
};
exports.isHouseObjectJSON = isHouseObjectJSON;
exports.VILLAGER_TYPES_ARRAY = [
    'farmer',
    'merchant',
    'lumberjack',
    'miner',
    'hunter',
    'butcher',
    'shepherd',
    'miller',
    'fisherman',
    'blacksmith',
    'builder',
    'miller',
    'weaver',
    'herbalist',
    'alchemist',
    'potter',
];
var Villager = /** @class */ (function () {
    function Villager(type, name, _id) {
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        this.friends = [];
        this.enemies = [];
        this._interactingWith = null;
        this.energy = 0;
        this.coins = 0;
        this.resources = {};
        this.cosmeticEnvironmentObjects = [];
        this.characterAttributes = {};
        this.assignedPlant = false;
        /**
         * Multipliers against the basic energy gain from producing each kind of
         * resource.
         *
         * Eg: If the basic energy cost of producing 1 unit of wheat is 10, and the
         * this villager's resourceProductionEnergyCostMultipliers[ResourceType.wheat]
         * is 1.5, then it costs 1.5 * 10 = 15 energy for this villager to produce 1
         * unit of wheat.
         *
         * {
         *  ResourceType.wheat: 1.5,
         *  ResourceType.sugar: 1.2,
         *  ResourceType.wood: 0.8,
         * }
         */
        this.resourceProductionEnergyCostMultipliers = new Map();
        /**
         * Similar to resourceProductionEnergyCostMultipliers, but for resource
         * consumption.
         *
         * {
         *  ResourceType.wood: 0.8, * 30
         *  ResourceType.wheat: 1.5, * 10
         *  ResourceType.sugar: 1.2, * 5
         *  ResourceType.steel: 0,
         * }
         */
        this.resourceConsumptionEnergyGainMultipliers = new Map();
        this.houseObject = null;
        this.assignment = null;
        this.asset = null;
        this.pos = null;
        this.villagerPath = [];
        this.type = type;
        this._id = _id;
        this.name = name;
    }
    Villager.prototype.serialize = function () {
        return {
            name: this.name,
            _id: this._id,
            type: this.type,
            friends: this.friends,
            enemies: this.enemies,
            interactingWith: this._interactingWith,
            energy: this.energy,
            coins: this.coins,
            resources: this.resources,
            cosmeticEnvironmentObjects: this.cosmeticEnvironmentObjects,
            resourceProductionEnergyCostMultipliers: (0, objectTyping_ts_1.mapToObject)(this.resourceProductionEnergyCostMultipliers),
            resourceConsumptionEnergyGainMultipliers: (0, objectTyping_ts_1.mapToObject)(this.resourceConsumptionEnergyGainMultipliers),
            characterAttributes: (0, objectTyping_ts_1.transformObjectValues)(this.characterAttributes, function (attributeValue) { return attributeValue.serialize(); }),
            houseObject: this.houseObject,
            assignment: this.assignment,
            asset: this.asset,
            pos: this.pos,
            basePos: this.basePos,
            villagerPath: __spreadArray([], this.villagerPath, true),
        };
    };
    Villager.deserialize = function (obj) {
        var villager = new Villager(obj.type, obj.name, obj._id);
        villager.friends = obj.friends;
        villager.enemies = obj.enemies;
        villager._interactingWith = obj.interactingWith;
        villager.energy = obj.energy;
        villager.coins = obj.coins;
        villager.resources = obj.resources;
        villager.cosmeticEnvironmentObjects = obj.cosmeticEnvironmentObjects;
        villager.resourceProductionEnergyCostMultipliers = new Map(Object.entries(obj.resourceProductionEnergyCostMultipliers));
        villager.resourceConsumptionEnergyGainMultipliers = new Map(Object.entries(obj.resourceConsumptionEnergyGainMultipliers));
        villager.characterAttributes = (0, objectTyping_ts_1.transformObjectValues)(obj.characterAttributes, function (attributeValue) { return AttributeValue.deserialize(attributeValue); });
        villager.houseObject = obj.houseObject;
        villager.assignment = obj.assignment;
        villager.asset = obj.asset;
        villager.pos = obj.pos;
        villager.basePos = obj.basePos;
        villager.villagerPath = __spreadArray([], obj.villagerPath, true);
        return villager;
    };
    return Villager;
}());
exports.Villager = Villager;
/**
 * @deprecated
 * We don't want to limit the kinds of resources to this fixed list, we also
 * want to be able dynamically add new kinds of resources to the game as it runs.
 */
// const RESOURCES_ARRAY = [
//   'wheat',
//   'corn',
//   'apples',
//   'pork',
//   'sugar',
//   'wood',
//   'steel',
//   'stone',
//   'iron',
//   'gold',
//   'diamond',
//   'coal',
//   'glass',
//   'fish',
//   'plough',
// ] as const;
/**
 * @deprecated Use ResourceId instead.
 */
// type ResourceType = (typeof RESOURCES_ARRAY)[number];
var RESOURCE_TYPES_ARRAY = ['edible', 'tool', 'material', 'luxury'];
var resourceOrigin;
(function (resourceOrigin) {
    resourceOrigin[resourceOrigin["bought"] = 0] = "bought";
    resourceOrigin[resourceOrigin["produced"] = 1] = "produced";
    resourceOrigin[resourceOrigin["gifted"] = 2] = "gifted";
})(resourceOrigin || (exports.resourceOrigin = resourceOrigin = {}));
var buyPref;
(function (buyPref) {
    buyPref[buyPref["wanted"] = 0] = "wanted";
    buyPref[buyPref["notWanted"] = 1] = "notWanted";
    buyPref[buyPref["needed"] = 2] = "needed";
})(buyPref || (exports.buyPref = buyPref = {}));
var Resource = /** @class */ (function () {
    function Resource(name, productionEnergyCostBasic, consumptionEnergyGainBasic, type, attirbuteAffinity, productionObject, _id, asset) {
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        if (asset === void 0) { asset = null; }
        this.name = name;
        this.productionEnergyCostBasic = productionEnergyCostBasic;
        this.consumptionEnergyGainBasic = consumptionEnergyGainBasic;
        this.type = type;
        this.attirbuteAffinity = attirbuteAffinity;
        this.productionObject = productionObject;
        this._id = _id;
        this.asset = asset;
    }
    Resource.prototype.serialize = function () {
        return {
            _id: this._id,
            name: this.name,
            productionEnergyCostBasic: this.productionEnergyCostBasic,
            consumptionEnergyGainBasic: this.consumptionEnergyGainBasic,
            type: this.type,
            attirbuteAffinity: this.attirbuteAffinity,
            productionObject: this.productionObject,
            asset: this.asset,
        };
    };
    Resource.deserialize = function (obj) {
        return new Resource(obj.name, obj.productionEnergyCostBasic, obj.consumptionEnergyGainBasic, obj.type, obj.attirbuteAffinity, obj.productionObject, obj._id, obj.asset);
    };
    return Resource;
}());
exports.Resource = Resource;
var Attribute = /** @class */ (function () {
    function Attribute(name, _id) {
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        this.name = name;
        this._id = _id;
    }
    Attribute.prototype.serialize = function () {
        return {
            _id: this._id,
            name: this.name,
        };
    };
    Attribute.deserialize = function (obj) {
        return new Attribute(obj.name, obj._id);
    };
    return Attribute;
}());
exports.Attribute = Attribute;
// type attributeValueId = string;
var AttributeValue = /** @class */ (function () {
    function AttributeValue(base, _id) {
        if (base === void 0) { base = 10; }
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        // List of boosts that modify the attribute value
        this.boosts = [];
        this.base = base;
        this._id = _id;
    }
    Object.defineProperty(AttributeValue.prototype, "totalValue", {
        // Adds up base attribute value and all active (not yet expired) boosts
        get: function () {
            return (this.base +
                this.boosts.reduce(function (acc, boost) { return acc + boost.currentValue; }, 0));
        },
        enumerable: false,
        configurable: true
    });
    AttributeValue.prototype.addBoost = function (boost) {
        this.boosts.push(boost);
    };
    AttributeValue.prototype.serialize = function () {
        return {
            _id: this._id,
            base: this.base,
            boosts: this.boosts.map(function (boost) { return boost.serialize(); }),
        };
    };
    AttributeValue.deserialize = function (obj) {
        var instance = new AttributeValue(obj.base, obj._id);
        instance.boosts = obj.boosts.map(function (boost) {
            return AttributeBoost.deserialize(boost);
        });
        return instance;
    };
    return AttributeValue;
}());
exports.AttributeValue = AttributeValue;
var AttributeBoost = /** @class */ (function () {
    /**
     *
     * @param value Value of attribute boost
     * @param duration Duration the boost lasts (in milliseconds)
     */
    function AttributeBoost(value, duration, expiration) {
        if (expiration === void 0) { expiration = Date.now() + duration; }
        this.value = value;
        this.duration = duration;
        this.expiration = expiration;
    }
    AttributeBoost.prototype.isExpired = function () {
        return Date.now() >= this.expiration;
    };
    Object.defineProperty(AttributeBoost.prototype, "originalValue", {
        get: function () {
            return this.value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AttributeBoost.prototype, "currentValue", {
        // Original value if not expired, 0 if expired
        get: function () {
            return this.isExpired() ? 0 : this.value;
        },
        enumerable: false,
        configurable: true
    });
    AttributeBoost.prototype.serialize = function () {
        return {
            value: this.value,
            duration: this.duration,
            expiration: this.expiration,
        };
    };
    AttributeBoost.deserialize = function (obj) {
        return new AttributeBoost(obj.value, obj.duration, obj.expiration);
    };
    return AttributeBoost;
}());
var isProductionObjectJSON = function (obj) {
    return (isEnviroObjectJSON(obj) && obj.enviroType === EnviroObjectType.PRODUCTION);
};
exports.isProductionObjectJSON = isProductionObjectJSON;
var ProductionObject = /** @class */ (function (_super) {
    __extends(ProductionObject, _super);
    function ProductionObject(name, resourceProductionProportions, workerCapacity, energyReserve, _id, asset) {
        if (energyReserve === void 0) { energyReserve = 0; }
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        if (asset === void 0) { asset = null; }
        var _this = _super.call(this, name, _id, asset, null, EnviroObjectType.PRODUCTION) || this;
        _this.resourceProductionProportions = resourceProductionProportions;
        _this.workerCapacity = workerCapacity;
        _this.energyReserve = energyReserve;
        return _this;
    }
    ProductionObject.prototype.serialize = function () {
        return __assign(__assign({}, _super.prototype.serialize.call(this)), { resourceProductionProportions: (0, objectTyping_ts_1.mapToObject)(this.resourceProductionProportions), workerCapacity: this.workerCapacity, energyReserve: this.energyReserve });
    };
    ProductionObject.prototype.deserialize = function (obj) {
        return new ProductionObject(obj.name, new Map(Object.entries(obj.resourceProductionProportions)), obj.workerCapacity, obj.energyReserve, obj._id, obj.asset);
    };
    return ProductionObject;
}(EnviroObject));
exports.ProductionObject = ProductionObject;
var SpecialItem = /** @class */ (function () {
    function SpecialItem(name, description, _id, asset) {
        if (_id === void 0) { _id = (0, createId_ts_1.default)(); }
        if (asset === void 0) { asset = null; }
        this.name = name;
        this.description = description;
        this._id = _id;
        this.asset = asset;
    }
    SpecialItem.prototype.serialize = function () {
        return {
            _id: this._id,
            name: this.name,
            description: this.description,
            asset: this.asset,
        };
    };
    SpecialItem.deserialize = function (obj) {
        return new SpecialItem(obj.name, obj.description, obj._id, obj.asset);
    };
    return SpecialItem;
}());
exports.SpecialItem = SpecialItem;
