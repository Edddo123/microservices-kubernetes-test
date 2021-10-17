import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("Mongo URI must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb-auth");
    app.listen(3000, () => {
      console.log("listening on port 3000");
    });
  } catch (error) {
    console.error(error);
  }
  
};

start();
