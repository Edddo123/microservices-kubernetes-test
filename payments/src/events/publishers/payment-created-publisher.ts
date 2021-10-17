import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@testtickets1221/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
