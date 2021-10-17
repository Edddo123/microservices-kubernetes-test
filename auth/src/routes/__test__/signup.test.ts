// make folder in same directory of what u wanna test with name of __test__ and have same filename with test.ts at the end
import request from "supertest";
import { app } from "../../app";

it("returns a 201 on succesfful signup", async () => {
  //   const x = 5;
  //   expect(x).toBe(5);
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(201);
});

it("returns 400 with invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email1: "test@test.com",
      password: "123123dsad",
    })
    .expect(400);
});

it("returns 400 with invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email1: "test@test.com",
      password: "1",
    })
    .expect(400);
});

it("returns 400 with missing email and password", async () => {
  // we either return request or await
  // if we write few we need to await
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com" })
    .expect(400);
  return request(app).post("/api/users/signup").send({}).expect(400);
});

it("disallow duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app) // its express res object so here we see what response object we have and what we are sending to client
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "123123dsad",
    })
    .expect(201);
    // when cookies are set, Set-Cookie header is set on response object so basically here we test that we get cookie once successfully signed up
  expect(response.get("Set-Cookie")).toBeDefined();
});
