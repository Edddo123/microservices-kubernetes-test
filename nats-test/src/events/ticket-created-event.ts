import { Subjects } from "./subjects";


// here this interface will be that T in created listener generic type so it must have subject property with enum and some data property that is ahs
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
