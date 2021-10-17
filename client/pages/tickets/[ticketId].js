// to have request parameter in a route u add [] so route would be here /tickets/:ticketId
import Router from "next/router";
import useRequest from "../../hooks/user-request";

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket?.id,
    },
    onSuccess: (order) =>
      Router.push("/orders/[orderId]", `/orders/${order.id}`), // when redirecting to wildcard route
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={(e) => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query; // whatever u name file, it will be query name
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;

// so when providing function to onlCick onClick={() => doRequest()} it receives event as argument, so if we reference doRequest it would get event as argument and recently we added props objec tto it which gets merged with request body and sent, so we provide anonymous function instead which invokes doRequest to ensure no extra props parameters are passed