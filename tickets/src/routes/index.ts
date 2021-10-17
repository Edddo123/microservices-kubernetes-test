import express, { Request, Response } from "express";
const router = express.Router();
import { Ticket } from "../models/ticket";

router.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined,
  }); // so only listing unbought/unreserved tickets

  res.send(tickets);
});

export { router as indexTicketRouter };
