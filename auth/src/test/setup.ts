// setup file
import { MongoMemoryServer } from "mongodb-memory-server"; // we will use mongo in memory server to quickly access it for tests
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";


// if file has top level import or export it is module file
// with module file
declare global { // new way of augmenting global object
    function  signin(): Promise<string[]>;
    // var NEW_GLOBAL: string; // also always declare with var, const and let dont work
}

// with non-module file
// declare function  signin(): Promise<string[]>;



let mongo: MongoMemoryServer;

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



global.signin = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  const cookie = response.get("Set-Cookie");

  return cookie;
};
