import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  req.session = null; // in docs thats how u destroy session for cookie-session library, it also removes it on client-side

  res.send({});
});

export { router as signoutRouter };
