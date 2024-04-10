import { MongoClient, ServerApiVersion } from 'mongodb';

const mongoURI: string = process.env.MONGODB_CONNECTION_STR;

const client = new MongoClient(mongoURI);
