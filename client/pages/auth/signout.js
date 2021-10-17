import Router from "next/router";
import { useEffect } from "react";
import UseRequest from "../../hooks/user-request";
import Signup from "./signin";

const Signout = () => {
  // so we must always make sign out request from browser since, if we set session to null and send it back toserver, server will have no idea what does that mean. It must come from the browser so cookie is removed and not used
  const { doRequest } = UseRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => Router.push("/"),
  });
  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing you out...</div>;
};

export default Signout;
