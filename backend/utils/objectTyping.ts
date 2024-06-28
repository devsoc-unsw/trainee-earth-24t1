export interface Serializable<JSONType extends JSONObject> {
  serialize(): JSONCompatible<JSONType>;
}

export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];
export type JSONValue = JSONPrimitive | JSONArray | JSONObject;

export type JSONCompatible<T> = unknown extends T
  ? never
  : {
      [P in keyof T]: T[P] extends JSONValue
        ? T[P]
        : T[P] extends NotAssignableToJson
        ? never
        : JSONCompatible<T[P]>;
    };

type NotAssignableToJson = bigint | symbol | Function;

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
export function transformObjectValues<T extends Record<string, any>, U>(
  obj: T,
  transformFn: (value: T[keyof T]) => U
): Record<keyof T, U> {
  const result: Partial<Record<keyof T, U>> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = transformFn(obj[key]);
    }
  }

  return result as Record<keyof T, U>;
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
export function mapToObject<K extends string, T extends JSONCompatible<T>>(
  map: Map<K, T>
): {
  [key in K]: JSONCompatible<T>;
} {
  const obj: {
    [key in K]: JSONCompatible<T>;
  } = Object.create(null);
  /**
   * {} is actually an instance of Object.prototype, which has a bunch of
   * properties and methods on it such as toString() and hasOwnProperty().
   * Object.create(null) creates an object that has no prototype; it is a
   * truly empty object.
   */

  map.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}

/**
 * Preserves the type of the object keys and values when applying
 * Object.entries(obj), particular the key type
 * Otherwise turns into [string, any][]
 *
 * Example:
 * ```
 * type KeyType = 'a' | 'b';
 * const obj: Record<KeyType, number> = { a: 1, b: 2 };
 * const entries = Object.entries(obj) as Entries<typeof obj>; // [KeyType, number][]
 * ```
 *
 */
export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

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
export function serializeMapToJSON<
  K extends string,
  V extends Serializable<JSONType>,
  JSONType extends JSONObject
>(map: Map<K, V>): { [k: string]: JSONCompatible<JSONType> } {
  const obj: { [k: string]: JSONCompatible<JSONType> } = Object.create(null);
  map.forEach((value, key) => {
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
export function deserializeJSONToMap<
  K extends string,
  V extends Serializable<JSONType>,
  JSONType extends JSONObject
>(
  obj: { [k: string]: JSONCompatible<JSONType> },
  deserializeFn: (json: JSONType) => V
): Map<K, V> {
  const map = new Map<K, V>();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      map.set(key as K, deserializeFn(obj[key] as JSONType));
    }
  }
  return map;
}
