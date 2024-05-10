import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import { User } from './types/databaseTypes.js';
import { Cell, Coordinates, PlayerMap } from './types/simulationTypes.js';

const mongoURI: string = process.env.MONGODB_CONNECTION_STR;
console.log(mongoURI);

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
    owner: 'N/A',
    object: null,
  };
  map.cells.set(origin, originCell);
  return map;
};
