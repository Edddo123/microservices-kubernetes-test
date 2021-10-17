import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear(); // clears terminal each time
const random = randomBytes(4).toString("hex");
const stan = nats.connect("ticketing", random, {
  // this ticketing seems to be clusterID which I chose as argument on docker container, second parameter seems to be clientId which should be different for each client
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("listener connected to nats");

  stan.on("close", () => {
    console.log("NATS connection closed");
    process.exit();
  });
  new TicketCreatedListener(stan).listen();
  // we provide options as this function calls
  // setting manual acknowledgment
  // const options = stan
  //   .subscriptionOptions()
  //   .setManualAckMode(true)
  //   .setDeliverAllAvailable()
  //   .setDurableName("accounting-service"); // when nats client connects after a restart or new client it receives all the events ever emitted
  // const subscription = stan.subscribe(
  //   "ticket:created",
  //   "order-service-queue-group-2", // setDeliverAllAvailable(); woks a bit different with queues
  //   options
  // ); // so we need to make sure copies of order service listen to same queue group
  // subscription.on("message", (msg: Message) => {
  //   const data = msg.getData();
  //   // it starts with a sequence number 1 and gets incremented on each event
  //   if (typeof data == "string") {
  //     console.log(
  //       `Received event number ${msg.getSequence()}, with data ${data}`
  //     );
  //   }
  //   msg.ack(); // to manually acknowledge event
  //   // console.log('message received')
  // });
});

process.on("SIGINT", () => stan.close()); // so it runs on ctrl C and works on windows too now
process.on("SIGTERM", () => stan.close());





// The 'SIGINT' event is emitted whenever the input stream receives a Ctrl+C input, known typically as SIGINT

// "ts-node-dev --rs --notify false src/publisher.ts", lets us run rs to restart it from terminal

// so lets say we scaled our order service and have 2 instances of it, so now if we publish event to some channel and have order service listening to it, identical event will be received by both identical services. We dont want that so we can create a queue group and if clients subscribe to a particular queue group, only 1 of the members will receive event. We can still have services outside of queue group listening to the channel or have multiple queue groups too

// so by default when we subscribe to event whenever we get into msg block nats will say oh okay event received everything is fine, however we may fail due to some error lets say db error and in that case we lose that event for ever. When setting acknowledgment to true, we must manually say that data was processed so we could add it after successful db write. If data is not acknowledged, then it would pass it down to another listener or to another listener in a queue, or to same one after some time. Default is 30s

/* So if we restart the listener and around same time publish new message, we may see that new message wont appear for some time, so that happens coz when we shutdown client, nats still waits for it some time as it thinks client temporarily went offline. When we configured container options:
hbi - its like interval of health checks
hbt - how long server waits for the response to consider it failed
hbf - how many times can client fail heartbeat response to be considered killed
So thats why NATS holds on to new published event since it thinks it will send it to that client but when its gone then it sends it off.

Also to monitor NATS we had port of 8222 opened and there we can go to links to see all the info on localhost:8222/streaming. On channels query, if we add query param of subs=1 we are gonna see more info about clients subscribed to a channel where we can examine late disconnection behaviour(since it stays there for some time)
*/

/*
So now lets say some service goes offline and lets say we couldnt exit gracefully(this process on SIGTERM SIGINT dont work always especially on windows there is no SIGTERM) and rely on health checks to turn client off, and we have continuous events receiving, we may publish event 5 and client receiving it is down, then we publish event 6 when new one comes back up and event 5 comes after so order gets mixed which can be problematic
*/

/*
Core Concurrency Issues:

*/
