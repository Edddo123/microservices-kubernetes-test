import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from "@testtickets1221/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
