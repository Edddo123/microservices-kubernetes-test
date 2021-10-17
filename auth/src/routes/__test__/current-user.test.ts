import request from "supertest";
import { app } from "../../app";

it("responds with details about current user", async () => {
  // supertest doesnt attach cookie automatically like browser and postman so we have to do it manually
  //   const authResponse = await request(app)
  //     .post("/api/users/signup")
  //     .send({
  //       email: "test@test.com",
  //       password: "123123dsad",
  //     })
  //     .expect(201);
  //   const cookie = authResponse.get("Set-Cookie");
  const cookie = await global.signin();
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("response with null if non auth", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
