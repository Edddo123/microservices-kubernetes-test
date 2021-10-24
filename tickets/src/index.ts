import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  console.log("starting tickets service");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("Mongo URI must be defined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("Mongo URI must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("Mongo URI must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("Mongo URI must be defined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    ); // clusterIP service name

    // also we did not write this logic inside natswrapper class cause it would be bad design choice to have sth that could shutdown the whole process somewhere inside a class, imagine if mongoose could exit our whole process on some method fail
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    }); // we exit gracefully when we get given events
    process.on("SIGINT", () => natsWrapper.client.close()); // so if its sigint event or sigterm we would do stan close which would trigger close event up above
    process.on("SIGTERM", () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb-tickets");
    app.listen(3000, () => {
      console.log("listening on port 3000");
    });
  } catch (error) {
    console.error(error);
  }
};

start();
