import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from "@testtickets1221/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = "orders-service";

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();
    // here version gets incremented but for our application when order is paid for we wont be updating this order by any of services so no further events will be emitted so we wont be publishing anything here

    msg.ack();
  }
}
