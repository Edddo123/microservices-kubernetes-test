import express from "express";
import "express-async-errors";
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@testtickets1221/common";
import cookieSession from "cookie-session";
import { createChargeRouter } from "./routes/new";

const app = express();
app.set("trust proxy", true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false, // doesnt need encryption
    secure: false,
  })
);

app.use(currentUser);

app.use(createChargeRouter);

// when u mark function as async it returns promise
app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
