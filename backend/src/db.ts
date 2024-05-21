import { Db, MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { User } from "./types/databaseTypes.js";
import {
  Cell,
  Coordinates,
  WorldMap,
  Villager,
  isVillager,
} from "./types/simulationTypes.js";
import createId from "./utils/createId.ts";

const mongoURI: string = process.env.MONGODB_CONNECTION_STR;

const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },

  // custom primary key factory. used for generating _id values for new documents
  // if the _id field is not specified in the document.
  pkFactory: { createPk: () => createId() },
});
let db: Db;

export async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    db = client.db("groveify");
    console.log("Connected to MongoDB");
  } finally {
    await client.close();
  }
}

export async function addUser(email: string) {
  try {
    const users = db.collection("users");
    const res = await users.insertOne({
      email: email,
    });
    console.log(`New user inserted with id: ${res.insertedId}`);
  } catch (e) {
    console.error(e);
  }
}

export async function getUserByEmail(email: string) {
  try {
    const users = db.collection("users");
    const user = await users.findOne({
      email: email,
    });
    return user;
  } catch (e) {
    console.error(e);
  }
}

const generateMap = (): WorldMap => {
  const map: WorldMap = new WorldMap();
  const origin: Coordinates = { x: 0, y: 0 };
  const originCell: Cell = {
    owner: undefined,
    object: null,
  };
  map.cells.set(origin, originCell);
  return map;
};

/**
 * Adds a new villager to the database.
 * Note that this method does not itself create a VillagerRequest object.
 *
 * @param {VillagerRequest} villager - The villager object to be added, sans an ID
 *                                     or interactingWith field.
 * @return {Promise<Villager>} The newly added villager with updated fields.
 */
export async function addVillager(
  villager: IVillagerDocument
): Promise<Villager | null> {
  try {
    // TODO: Should villagers store interactingWith on the server?
    //       Right now, they do not. Something to think about.
    const villagers = db.collection("villagers");
    const res = await villagers.insertOne(villager);
    console.log(`New villager inserted with id: ${res.insertedId}`);

    const newVillager: any = {
      ...villager,
      _id: res.insertedId,
      interactingWith: null,
    };

    return isVillager(newVillager) ? newVillager : null;
  } catch (e) {
    console.error(e);
  }
}

export async function getVillager(id: ObjectId): Promise<Villager | null> {
  try {
    const villagers = db.collection("villagers");
    const villager = await villagers.findOne({
      _id: id,
    });
    return isVillager(villager) ? villager : null;
  } catch (e) {
    console.error(e);
  }
}

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
