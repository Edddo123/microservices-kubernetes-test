export const natsWrapper = {
  client: {
    // publish: (subject: string, data: string, callback: () => void) => {
    //     // callback gets executed right away to we resolve promise
    //   callback();
    // },
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
/* so to fake it, we have natsWrapper which has client property inside, in our file named new we call new TicketCreatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    price: ticket.price,
    title: ticket.title,
    userId: ticket.userId,
  });
  and if we look into publish method it will call publish function on this client which would insert subject, data and have callback function. we iinvoke callback function right away cause we want promise to get resolved asap
  return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          reject(err);
        }
        console.log("Event published to " + this.subject);
        resolve();
      });
    }); if we look inside we would call publish function and when it would be done we would go into callback function where at the end is resolve() which resolves promise, so now after calling publish which would wrap this.client.publish function inside a promise, we would call this 3rd callback function ourselves so then it resolves. In normal scenario callback function is called when event would be published by nats, so we faking same behaviour.
  */
