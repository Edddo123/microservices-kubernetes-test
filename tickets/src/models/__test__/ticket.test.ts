import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // create an instance of the ticket
  const ticket = Ticket.build({
    title: "asda",
    price: 5,
    userId: "123",
  });

  // save the ticket to the db
  await ticket.save(); // here this ticket will get assigned version number 0

  // fetch the ticket twice

  // here both tickets have version 0
  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  // make two seprate changes to the tickets(1 to each fetched ticket)

  ticket1!.set({ price: 10 });
  ticket2!.set({ price: 15 });

  // save first fetched ticket
  // here mongoose will go to mongodb and find document with id of ticket1.id and version of 0, once found update the document and change version to 1
  await ticket1!.save();

  // save the 2nd fetched ticket - its gonna have outdated version number so we expect version control error
  try {
    // now here ticket2 still have version of 0, so when trying to find document with id of ticket2 and version of 0 we get nth and library throws error because now that document has version 1 and our fetched document is stale. This way we will version documents in correct order and make sure noone tries to update outdates version and all updates will happen in order. So from what I guess it;s application level lock for OCC but still does not make much sense
    await ticket2!.save();
  } catch (err) {
    return;
  }
  // we get error of: No matching document found for id "61619b63c8c2a5e28efe6258" version 0 modifiedPaths "price"
  throw new Error("Should not reach this");
});

it("increments version number of multiple saves", async () => {
  const ticket = Ticket.build({
    title: "asda",
    price: 5,
    userId: "123",
  });

  await ticket.save(); // so for this library to increment, we need to make sure we update db record with save method
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
