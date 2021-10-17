import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
}); // client to use nats , usually called stan

// so we are gonna publish events to nats from this client and we will have listener client to subscribe to those events
// not to access NATS in kubernetes cluster, we could just use ingress, or nodePort or even easier just port forward it which would open it up for us for development
// kubectl port-forward nats-depl-7cff849756-bdsw4 4222:4222   left one is port on our localmachine and right one is port of a pod
stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 20,
    });
  } catch (error) {
    console.error(error);
  }

  // const data = JSON.stringify({
  //   //nats same as http requires string to transport data, so we will turn it into JSON
  //   id: "123",
  //   title: "concert",
  //   price: 20,
  // });

  // stan.publish("ticket:created", data, (err, data) => {
  //   // this would publish to NATS server, first argument is subject or the channel we are publishing to
  //   console.log("data published");
  //   console.log("data here", data); // returns some kind of id here called guid
  // });
});
