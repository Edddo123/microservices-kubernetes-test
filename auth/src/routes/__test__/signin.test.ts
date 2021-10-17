import request from "supertest";
import { app } from "../../app";

it("fails when nonexistent email is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(400);
});

it("fails when password is incorrect", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "11111aa",
    })
    .expect(400);
});

it("sets cookie after successful sign in", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});
