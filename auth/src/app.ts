import express from "express";
import "express-async-errors"; // thats same as require("route") so initializing directly
// with this package we can throw error even in async functions no next is required
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
// import { errorHandler } from "./middlewares/error-handler";
// import { NotFoundError } from "./errors/not-found-error";
import { errorHandler } from "@testtickets1221/common";
import { NotFoundError } from "@testtickets1221/common";
import cookieSession from "cookie-session";

const app = express();
app.set("trust proxy", true); // express will sit behind proxy of ingress so we should allow requests from proxy, so trafiic is proxies to us through ingress

app.use(express.json());
app.use(
  cookieSession({
    signed: false, // doesnt need encryption
    secure: false, // must be on https, so it only sets cookie if its https and jest sets NODE_ENV to test when run // process.env.NODE_ENV !== "test"
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// when u mark function as async it returns promise
app.all("*", async (req, res, next) => {
  //next(new NotFoundError()); // we can just throw it like this with async
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

// So we are gonna use supertest libraries to make requests to our express app which will run on ephemeral port so in future we dont have to keep track of ports, so we decided to have server setup separated from configuration and startup part so now we can use app in our supertest library without having it listen on port 3000. There also will be other benefits which we are gonna see later.
