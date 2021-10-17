import { Publisher, ExpirationCompleteEvent, Subjects } from "@testtickets1221/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}
