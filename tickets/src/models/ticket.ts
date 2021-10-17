import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current"; // to add versioning with optimistic concurrency control approach

interface TicketAttrs {
  // used for building ticket
  title: string;
  price: number;
  userId: string;
}

interface TicketDoc extends mongoose.Document {
  // mongodb document we get
  title: string;
  price: number;
  userId: string;
  version: number; // __v was available inside mongoose Document interface but we have to add version ourselves
  orderId?: string;  
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set("versionKey", "version"); // so intead of __v we are gonna get version which is more intuitive
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
