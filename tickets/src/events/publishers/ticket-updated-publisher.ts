import {
    Publisher,
    Subjects,
    TicketUpdatedEvent,
  } from "@testtickets1221/common";
  
  export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  }
  