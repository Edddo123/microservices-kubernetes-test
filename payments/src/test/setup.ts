// setup file
import { MongoMemoryServer } from "mongodb-memory-server"; // we will use mongo in memory server to quickly access it for tests
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Buffer } from "buffer";
import crypto from "crypto";

declare global {
  function signin(id?: string): string[];
}

let mongo: MongoMemoryServer;

jest.mock("../nats-wrapper.ts"); // every file will use fake
// jest.mock("../stripe.ts");

process.env.STRIPE_KEY =
  "sk_test_51HnYlUHOXCTwbGJdYd9dzsau3QpI89o6Cgz329c37l1EwjmImp5EaPKu8bOKsW2OneJCf8OzObw8J678C4NRNLkn00mOC2w7nj";

beforeAll(async () => {
  // before running all the tests we are gonna launch isntance of in memory mongo and connect mongoose
  process.env.JWT_KEY = "12";
  mongo = new MongoMemoryServer();
  // await mongo.start()
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // before each of the tests we are gonna clear collections

  jest.clearAllMocks(); // so mock jest function we wrote out is reused on all tests so we gotta reset before each test so test data does not get polluted from other test cases
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // after all tests we are gonna stop mongo server and drop all collections

  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // build a jwt payload
  const random = id || crypto.randomBytes(8).toString();
  const payload = {
    id: random,
    email: "test@test.com",
  };
  // create a jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // build session object {jwt: token}
  const session = { jwt: token };

  // turn session into JSON
  const sessionJSON = JSON.stringify(session);
  // take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats a cookie with encoded data so we can fake sign in
  return [`express:sess=${base64}`]; // supertest expects all of the cookies in array
};
