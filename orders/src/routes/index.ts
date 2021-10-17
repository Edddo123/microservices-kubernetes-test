import express, { Request, Response } from "express";
import { Order } from "../models/order";
import { requireAuth } from "@testtickets1221/common";

const router = express.Router();

router.get(
  "/api/orders",
  requireAuth,
  async (req: Request, res: Response, next) => {
    const orders = await Order.find({ userId: req.currentUser!.id }).populate(
      "ticket"
    ); // just linking ticket collection here with ticket reference saved in order collection
    
    res.send(orders);
  }
);

export { router as indexOrderRouter };
