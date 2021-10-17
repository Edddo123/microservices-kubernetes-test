import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { body } from "express-validator";
import {
  validateRequest,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  BadRequestError,
} from "@testtickets1221/common";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .not()
      .isEmpty() // handles both empty string and nth
      .withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    const { title, price } = req.body;
    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket?.orderId) {
      throw new BadRequestError("Can not edit a reserved ticket");
    }

    if (req.currentUser?.id !== ticket.userId) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title,
      price,
    });
    await ticket.save(); // it will update not olny in db, but our in memory ticket version right here as well

    // so if we dont await here, even if there is error thrown we wont capture it since response to user will already be sent
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      // when we succesffuly update ticket in db, we publish event
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };

/*
There are some big possible concerns:
1) Lets say we fail to publish an event for some reason, this way we will have it saved in db, but other service wont know about it. To handle it we could add event and ticket itself to the database, so create event collection that would save this event, then we can have separate process running, that would check for events collection updating and publish those events to nats and if its success, then we are gonna mark it as sent true inside events collection. Also we would use database transactions to make sure we add ticket info in ticket collection and also add event info into event collection and if any of them fails, then we rollback and dont do either of them.
*/
