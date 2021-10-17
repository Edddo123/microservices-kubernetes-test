import request from "supertest";
import { app } from "../../app";

it("cleares cookie after signout", async () => {
  const response1 = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200);

  expect(response.get("Set-Cookie")[0]).toEqual(
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
  // this is reponse we get on expired cookie after logout so we check for it
});
