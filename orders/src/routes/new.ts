import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
  BadRequestError,
} from "@testtickets1221/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { natsWrapper } from "../nats-wrapper";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";

const router = express.Router();

// would be smarter to have as env
const EXPIRATION_WINDOW_SECONDS = 1 * 60; // 15 minutes

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input)) // also we must be aware that we are creating coupling here since if ticketservice changes its db, this id check will no longer be valid
      .withMessage("Ticket id must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Find the ticket user is trying to order in the db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure ticket is not already reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    // Calculate expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to db
    const order = Order.build({
      userId: req.currentUser!.id, // coz we are checking for authentication up in middlewares and typescript doesnt see it there
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // Publish event that order was created
    console.log("ma ticket", ticket);
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status as OrderStatus, // we know its orderstatus but coz of mongoose bug i had to change it
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(), // by default when dates get stringified for json, they adjust to current timezone and turn into string, so instead we turn it into more standard format like UTC
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
