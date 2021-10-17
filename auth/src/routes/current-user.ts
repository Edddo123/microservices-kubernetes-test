import express from "express";
import jwt from "jsonwebtoken";
// import { currentUser } from "../middlewares/current-user";
import { currentUser } from "@testtickets1221/common";

// import { requireAuth } from "../middlewares/require-auth"; just for testing since we dont need it here

const router = express.Router();

// so cookies that we set are httpOnly which means its not programatically accessible, so we will have this route for react application to check if user is logged in.
// we first check if user has req.session.jwt and if jwt is valid we will return payload
// router.get("/api/users/currentuser", currentUser, requireAuth, (req, res) => {

router.get("/api/users/currentuser", currentUser, (req, res) => {
  // if (!req.session?.jwt) {
  //   // its getting type definition from library
  //   return res.send({ currentUser: null });
  // }
  // try {
  //   const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
  //   res.send({ currentUser: payload });
  // } catch (err) {
  //   res.send({ currentUser: null });
  // }
  // after writing middleware we only need this line here
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
