import { Listener, OrderCreatedEvent, Subjects } from "@testtickets1221/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = "tickets-service";

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // find the ticket order is reserving
    const ticket = await Ticket.findById(data.ticket.id);
    // if no ticket throw error
    if (!ticket) {
      throw new Error("ticket not found");
    }

    // Mark ticket as being reserved by setting orderId property
    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();

    // we add await so if error occurs event would not be acknowledged as well
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId
    });

    // so here we need to publish ticket updated event, however we need nats client for that. We could import natswrapper but that would create additional complexity when testing with mock wrapper. We also have client in the base class which is private field so is not accessible even in subclasses. So we could just mark it as protected instead of private and use client directly from base listener

    // ack the message
    msg.ack();
  }
}

// so right now when we reserve the ticket with this event, version of this ticket gets updated but version in order service stays same. And lets say in future I have cancel logic, same would happen. And now if I edit the ticket and send ticket:updated event it would get me to version 3 but in my order service I would still have version 1 and we would throw an error since 1 is not 3-1.
