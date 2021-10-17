// setup file
import { MongoMemoryServer } from "mongodb-memory-server"; 
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Buffer } from "buffer";
import crypto from "crypto";

declare global {
  function signin(): string[];
}

let mongo: MongoMemoryServer;

jest.mock("../nats-wrapper.ts"); 

beforeAll(async () => {
  
  process.env.JWT_KEY = "12";
  mongo = new MongoMemoryServer();
  
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
 

  jest.clearAllMocks(); 
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  

  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  const random = crypto.randomBytes(8).toString();
  const payload = {
    id: random,
    email: "test@test.com",
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");
  return [`express:sess=${base64}`]; 
};
