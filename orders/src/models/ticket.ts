import mongoose from "mongoose";
import { Order, OrderStatus } from "./order"; // just to have 1 source about everything order related
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttr {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttr): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
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
      min: 0,
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

// by editing where u add filter to save function, so traditionally save() just uses id to filter but here we added version too
// ticketSchema.pre("save", function (done) {
//   this.$where = {
//     version: this.get("version") - 1, // here we modify our versioning semantics
//   };

//   done();
// });

ticketSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  return await Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.statics.build = (attrs: TicketAttr) => {
  // We have to remember inside mongodb we have _id property not id
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.methods.isReserved = async function () {
  // this here will equal to the ticket document instance
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        // some kind of error with mongoose on types, so have to disable status enum type on document itself
        OrderStatus.Created,
        OrderStatus.Complete,
        OrderStatus.AwaitingPayment,
      ],
    },
  });
  return !!existingOrder; // if its null it will be converted to true and then false but if its truthy its gonna get flipped to false first and then to true
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };

// @ts-ignore
// this comments helps us ignore ts

