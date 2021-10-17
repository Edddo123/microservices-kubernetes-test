import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

// So we will move this abstract class listener, enum subjects and interfaces for events in Common module and sublclasses of the listener class in the services itself

interface Event {
  subject: Subjects;
  data: any;
}
// T extends Event which means when we created interface for specific events, we must have subject which is one of the enums and data 
export abstract class Listener<T extends Event> { // so we add generic type so we can check in our listeners for specific types which must have given subject and data
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message): void; // so here we say whatever interface we provide as T, it must have data property and it can be anything

  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Message received :${this.subject}/${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);

      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}
