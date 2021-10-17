import { Listener, OrderCreatedEvent, Subjects } from "@testtickets1221/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = "expiration-service";
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // so for delay we want it to get delayed at expires at time which should be around 15 minutes
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime(); // getTime returns miliseconds value
    console.log("waiting this many ms", delay);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    ); // amount of milisecond delay until job can be processed

    msg.ack();
  }
}
