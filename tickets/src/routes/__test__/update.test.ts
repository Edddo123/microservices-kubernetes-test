import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns 404 if provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({ title: "sdad", price: 20 })
    .expect(404);
});

it("returns 401 if user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "sdad", price: 20 })
    .expect(401);
});

it("returns 401 if user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "sada",
      price: 20,
    });

  await request(app)
    .put("/api/tickets/" + response.body.id)
    .set("Cookie", global.signin())
    .send({ title: "asda", price: 23 })
    .expect(401);
});

it("returns 400 if invalid title or price", async () => {
  const cookie = global.signin(); // to have same user
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "sada",
      price: 20,
    });

  await request(app)
    .put("/api/tickets/" + response.body.id)
    .set("Cookie", cookie)
    .send({ title: "asda" })
    .expect(400);
});

it("updates tickets with valid input", async () => {
  const cookie = global.signin(); // to have same user
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "sada",
      price: 20,
    });

  await request(app)
    .put("/api/tickets/" + response.body.id)
    .set("Cookie", cookie)
    .send({ title: "asda", price: 21 })
    .expect(200);

  const ticket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticket.body.title).toEqual("asda");
  expect(ticket.body.price).toEqual(21);
});

it("publishes an event", async () => {
  const cookie = global.signin(); // to have same user
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "sada",
      price: 20,
    });

  await request(app)
    .put("/api/tickets/" + response.body.id)
    .set("Cookie", cookie)
    .send({ title: "asda", price: 21 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if ticket is reserved", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "sada",
      price: 20,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put("/api/tickets/" + response.body.id)
    .set("Cookie", cookie)
    .send({ title: "asda", price: 21 })
    .expect(400);
});
