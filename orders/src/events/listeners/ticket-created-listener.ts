import { Message } from "node-nats-streaming";
import {
  Subjects,
  Listener,
  TicketCreatedEvent,
} from "@testtickets1221/common";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "orders-service";

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    // so for order service, it needs ticket created event to create local copy of a ticket in the service which can be used without sync communication with ticket service
    const { id, price, title } = data;
    // we should also add id property since mongoose will generate its own id and we will have 2 same tickets with different id. Also we have to remember inside mongodb we have _id property not id
    const ticket = Ticket.build({
      id,
      price,
      title,
    });
    await ticket.save();

    msg.ack();
  }
}
