"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteImage = exports.Asset = void 0;
var createId_ts_1 = require("@backend/utils/createId.ts");
var date_ts_1 = require("@backend/utils/date.ts");
var Asset = /** @class */ (function () {
    function Asset(description, name, type, date, id, remoteImages, dimensions) {
        if (date === void 0) { date = new Date(); }
        if (id === void 0) { id = (0, createId_ts_1.default)(); }
        if (remoteImages === void 0) { remoteImages = []; }
        if (dimensions === void 0) { dimensions = { dx: 0, dy: 0 }; }
        this.description = description;
        this.type = type;
        this.date = date;
        this._id = id;
        this.remoteImages = remoteImages;
        this.dimensions = dimensions;
        this.name = name !== null && name !== void 0 ? name : this._id;
    }
    Asset.prototype.getFilename = function () {
        return "".concat(this.name, ".").concat(this.type);
    };
    Asset.prototype.addRemoteImage = function (remoteObject) {
        this.remoteImages.push(remoteObject);
    };
    Asset.prototype.getRemoteImages = function () {
        return this.remoteImages;
    };
    Asset.prototype.getDimensions = function () {
        return this.dimensions;
    };
    Asset.prototype.setDimensions = function (dimensions) {
        this.dimensions = dimensions;
    };
    Asset.prototype.serialize = function () {
        return {
            description: this.description,
            name: this.name,
            type: this.type,
            date: (0, date_ts_1.toIsoStringWithTimezone)(this.date),
            _id: this._id,
            remoteImages: this.remoteImages.map(function (remoteImage) {
                return remoteImage.serialize();
            }),
            dimensions: this.dimensions,
        };
    };
    Asset.deserialize = function (obj) {
        return new Asset(obj.description, obj.name, obj.type, new Date(obj.date), obj._id, obj.remoteImages.map(function (remoteImageObj) {
            return RemoteImage.deserialize(remoteImageObj);
        }), obj.dimensions);
    };
    return Asset;
}());
exports.Asset = Asset;
var RemoteImage = /** @class */ (function () {
    function RemoteImage(name, url) {
        this.name = name;
        this.url = url;
    }
    RemoteImage.prototype.serialize = function () {
        return {
            name: this.name,
            url: this.url,
        };
    };
    RemoteImage.deserialize = function (obj) {
        return new RemoteImage(obj.name, obj.url);
    };
    return RemoteImage;
}());
exports.RemoteImage = RemoteImage;
