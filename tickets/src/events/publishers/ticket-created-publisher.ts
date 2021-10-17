import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@testtickets1221/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
