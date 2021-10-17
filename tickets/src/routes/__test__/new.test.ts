import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

// jest.mock("../../nats-wrapper.ts"); // so in our tests, we initialize mongodb memory server but we dont have running nats client. We could have it but it would mean for our tests we would needs nats all the time, so isntead we are gonna fake it and everywhere we import nats, we are gonna use our fake natsWrapper implementation inside jest

/*
1) Find the file u want to fake
2) In same directory, create a folder called __mocks__
3) in that folder create a file with identical name of a file we want to fake
4) write fake implementation
5) Tell jest to use it.
*/

// we write tests first and then make them pass with the code - test driven development

it("has a route handler /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404); // if no route is found we return 404 error so thats how we check for existence
});

it("can only be accessed if user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({}).expect(401); // same as before
  //   expect(response.status).toEqual(401)
});

it("returns a status than 401 if user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});
it("returns an error if invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asda",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asda",
    })
    .expect(400);
});
it("creates a ticket with valid input", async () => {
  // add in a check to make sure ticket was saved
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asdsada",
      price: 20,
    })
    .expect(201);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
});

it("publishes an event", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asdsada",
      price: 20,
    })
    .expect(201);

    // so we add jest.fn mock function to test if that function was invoked, what arguments it received and things like that
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
