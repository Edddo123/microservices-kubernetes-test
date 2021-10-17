import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from "@testtickets1221/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
