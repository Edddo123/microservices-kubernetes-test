import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@testtickets1221/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

// here we want to test the listener basically how tickets handle the event of order creation

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    price: 20,
    title: "concert",
    userId: "asd",
  });

  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "asda",
    expiresAt: "adsa",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, listener };
};

it("sets the orderId of the ticket", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes ticket updated event", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  ); // so typescript knows that this is mock function

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});

// @ts-ignore
// console.log(natsWrapper.client.publish.mock.calls);

// we get array of invocations and each of them is another array, which has function arguments and as u remember publish has subject, data and callback function as argumens

// [
//   [
//     'ticket:updated',
//     '{"id":"616214cf4c07ca5836165ddb","title":"concert","price":20,"userId":"asd","version":1,"orderId":"616214cf4c07ca5836165ddd"}',
//     [Function (anonymous)]
//   ]
// ]
