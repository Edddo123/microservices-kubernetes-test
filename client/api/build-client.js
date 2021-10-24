import axios from "axios";

const BuildClient = ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL:
        "http://ticketingtestprodrandom.xyz/",
      headers: req.headers,
    });
  } else {
    return axios.create({
      baseURL: "/",
    });
  }
};

export default BuildClient;
