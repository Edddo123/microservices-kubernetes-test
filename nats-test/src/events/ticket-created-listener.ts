import { Listener } from "./base-listener";
import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> { // here we have TicketCreatedEvemt which is obliged to have subject of type enum and data property since its extended in abstract class on T
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "payments-servce";

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("Event data", data);

    msg.ack();
  }
}
