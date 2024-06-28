"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformObjectValues = transformObjectValues;
exports.mapToObject = mapToObject;
exports.serializeMapToJSON = serializeMapToJSON;
exports.deserializeJSONToMap = deserializeJSONToMap;
/**
 * Don't use this interface. It's just for reference when making deserialize
 * functions for classes that you want to instantiate from serialized JSON.
 * Make the method static.
 *
 * Example:
 * class MyClass {
 *    constructor(public f1: string, public f2: number) {}
 *
 *    static deserialize(obj: { f1: string, f2: number }): MyClass {
 *      return new MyClass(obj.f1, obj.f2);
 *    }
 * }
 */
// export interface Deserializer {
//   deserialize: (obj: JSONValue) => Object;
// }
/**
 * Creates a new copied object and transforms the object's values using a
 * provided function.
 */
function transformObjectValues(obj, transformFn) {
    var result = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = transformFn(obj[key]);
        }
    }
    return result;
}
/**
 * Alternative method to achieve the same result as transformObjectValues.
 */
// function transformObjectValuesCustom<T extends JSONCompatible<T>, U>(
//   obj: T,
//   transformFn: (value: T[keyof T]) => U
// ): { [key in keyof T]: U } {
//   const result: { [key in keyof T]: U } = Object.create(null);
//   for (const key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       result[key] = transformFn(obj[key]);
//     }
//   }
//   return result;
// }
/**
 * Used to turn a map into an object. The key type must be a string and the
 * value type must be JSON compatible.
 *
 * Example:
 * ```
 * const map = new Map<string, number>([['a', 1], ['b', 2]]);
 * const obj = mapToObject(map);
 * console.log(obj); // { a: 1, b: 2 }
 * ```
 *
 * @param map An instance of Map, with constraints as described above.
 * @returns
 */
function mapToObject(map) {
    var obj = Object.create(null);
    /**
     * {} is actually an instance of Object.prototype, which has a bunch of
     * properties and methods on it such as toString() and hasOwnProperty().
     * Object.create(null) creates an object that has no prototype; it is a
     * truly empty object.
     */
    map.forEach(function (value, key) {
        obj[key] = value;
    });
    return obj;
}
/**
 * Convert from map:
 *  Map<MyTypeId extends string, MyType extends Serializable<MyTypeJSON>>
 * to object:
 *  { [typeId: string]: MyTypeJSON }
 *
 * Example:
 * ```
 * type CatId = string;
 * interface CatJSON extends JSONObject {}
 * class Cat implements Serializable<CatJSON> {}
 *
 * const map: Map<CatId, Cat> = new Map();
 * map.set('cat1', new Cat());
 * map.set('cat2', new Cat());
 * const obj = serializeMapToJSON<CatId, Cat, CatJSON>(map);
 * console.log(obj); // { cat1: {...}, cat2: {...} }
 * ```
 *
 * Initially made to replace the following:
 *
 * ```typescript
 * export class SimulationState {
 *
 *   // ...
 *
 *   serialize(): JSONCompatible<SimulationStateJSON> {
 *   return {
 *     // ...
 *     villagers: Object.fromEntries<VillagerJSON>(
 *       (
 *         Object.entries(this.villagers) as Entries<
 *           Record<VillagerId, Villager>
 *         >
 *       ).map(([k, v]) => [k, v.serialize()])
 *     ),
 *     attributes: Object.fromEntries<AttributeJSON>(
 *       (
 *         Object.entries(this.attributes) as Entries<
 *           Record<AttributeId, Attribute>
 *         >
 *       ).map(([k, v]) => [k, v.serialize()])
 *     ),
 *     enviroObjects: Object.fromEntries<EnviroObjectJSON>(
 *       (
 *         Object.entries(this.enviroObjects) as Entries<
 *           Record<EnviroObjectId, EnviroObject>
 *         >
 *       ).map(([k, v]) => [k, v.serialize()])
 *     ),
 *     resources: Object.fromEntries<ResourceJSON>(
 *       (
 *         Object.entries(this.resources) as Entries<
 *           Record<ResourceId, Resource>
 *         >
 *       ).map(([k, v]) => [k, v.serialize()])
 *     ),
 *   };
 * }
 * ```
 */
function serializeMapToJSON(map) {
    var obj = Object.create(null);
    map.forEach(function (value, key) {
        obj[key] = value.serialize();
    });
    return obj;
}
/**
 * Inverse of serializeMapToJSON()
 *
 * Made to replace this:
 * ```typescript
 * export class SimulationState {
 *   // ...
 *   static deserialize(obj: JSONCompatible<SimulationStateJSON>): SimulationState {
 *     const state = new SimulationState(obj._id);
 *     state.worldMap = WorldMap.deserialize(obj.worldMap);
 *     state.villagers = new Map(
 *       Object.entries(obj.villagers).map(([k, v]) => [
 *         k,
 *         Villager.deserialize(v),
 *       ])
 *     );
 *     state.enviroObjects = new Map(
 *       Object.entries(obj.enviroObjects).map(([k, v]) => [
 *         k,
 *         EnviroObject.deserialize(v),
 *       ])
 *     );
 *     state.resources = new Map(
 *       Object.entries(obj.resources).map(([k, v]) => [
 *         k,
 *         Resource.deserialize(v),
 *       ])
 *     );
 *     return state;
 *   }
 * }

 */
function deserializeJSONToMap(obj, deserializeFn) {
    var map = new Map();
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            map.set(key, deserializeFn(obj[key]));
        }
    }
    return map;
}
