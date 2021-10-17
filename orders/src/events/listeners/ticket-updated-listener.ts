import { Message } from "node-nats-streaming";
import {
  Subjects,
  Listener,
  TicketUpdatedEvent,
} from "@testtickets1221/common";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = "orders-service";

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { id, price, title } = data;
    const ticket = await Ticket.findByEvent(data);

    // so we only acknowledge if version of ticket stored in order service is 1 version lower than ticket services one so we know its correct order, also once error is thrown, nATS will add it back to queue since it didnt get acknowledgment and retry based on our set timeouts
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    // ticket.set({ title, price, version }); // handling versioning without library
    // so we may choose to handle without library since we dont have any dependancy on version semantics

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
