import { Db, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { User } from './types/databaseTypes.js';
import {
  Cell,
  Coordinates,
  PlayerMap,
  VillagerRequest,
  Villager,
  isVillager,
} from './types/simulationTypes.js';

const mongoURI: string = process.env.MONGODB_CONNECTION_STR;

const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let db: Db;

export async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    db = client.db('groveify');
    console.log('Connected to MongoDB');
  } finally {
    await client.close();
  }
}

export async function addUser(email: string) {
  try {
    const users = db.collection('users');
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
    const users = db.collection('users');
    const user = await users.findOne({
      email: email,
    });
    return user;
  } catch (e) {
    console.error(e);
  }
}

const generateMap = (): PlayerMap => {
  const map: PlayerMap = { cells: new Map<Coordinates, Cell>() };
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
  villager: VillagerRequest
): Promise<Villager | null> {
  try {
    // TODO: Should villagers store interactingWith on the server?
    //       Right now, they do not. Something to think about.
    const villagers = db.collection('villagers');
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
    const villagers = db.collection('villagers');
    const villager = await villagers.findOne({
      _id: id,
    });
    return isVillager(villager) ? villager : null;
  } catch (e) {
    console.error(e);
  }
}
