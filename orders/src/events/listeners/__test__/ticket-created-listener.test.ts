import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event
  const data = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "movie",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  // now ts believes its Message type
  const msg: Message = {
    ack: jest.fn(), // mock function
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();
  // call onMessage function with data and message
  await listener.onMessage(data, msg);
  // write assertions to make sure ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // call onMessage function with data and message
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function worked
  expect(msg.ack).toHaveBeenCalled();
});
