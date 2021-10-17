import Router from "next/router";
import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/user-request";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft(); // since setInterval waits for 1sec to invoke it
    const timerId = setInterval(findTimeLeft, 1000); // call it once every sec, also setInterval for 1st execution waits for that time, so it doesnt run immediately

    return () => {
      clearInterval(timerId);
    }; // when u return function from useEffect and u have empty array as dependency list, it only gets called when we are about to navigate away from this component
    // if u have dependency listed in array, then its also getting called when component is about to rerender
  }, [order]); // I want to start setInterval only once
  // order wont change so it will still run only once
  if (timeLeft < 0) {
    return <div>Order expired</div>;
  }

  // so basically when we get to that page we will calculate seconds left and start setInterval which will recalculate it every second, if we navigate away, setInterval stops. If we go back we will recalculate time and then start setInterval again
  return (
    <div>
      {timeLeft} seconds until order expires
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51HnYlUHOXCTwbGJdJL7tv5kfhNqXb8gVObiQqN7BECFdXG6bDKDubAHlRXQaJmWd5497KtOXDbe10BVOmZPlMNhh00TVXOOp2Y"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;

// 4242 4242 4242 4242 - its visa credit card number to test charges on testMode
