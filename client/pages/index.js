// import buildClient from "../api/build-client";
import Link from "next/link";

const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/tickets");
  // console.log('logged on server or client');

  return { tickets: data };
};

export default LandingPage;

// So when request goes to nextjs client, it first inspects url and determines which components to show, Call getInitialProps method of those components, render the component itself with the possibility of data gained from initial props, assemble html and send it back as response.
// So when we want to fetch data when things are rendered on serverside, we make those calls in getInitialProps method and return object from it which is passed to our main component as prop which actually gets rendered and sent back, so we cant directly do it in our component.
// We can use useRequest hook we created inside react component but getintialProps is just a function not a react component so it cant be used there

// const client = buildClient(context); // for more readability
//   const { data } = await client.get("/api/users/currentuser");
//   return data;


// <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}> Thats how to write link element when writing navigation to query route
//             <a>View</a>
//           </Link>