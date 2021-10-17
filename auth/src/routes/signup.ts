import express, { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { DatabaseConnectionError } from "@testtickets1221/common";
// import { DatabaseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "@testtickets1221/common";
// import { RequestValidationError } from "../errors/request-validation-error";
import { User } from "../models/user";
// import { BadRequestError } from "../errors/bad-request-error";
import { BadRequestError } from "@testtickets1221/common"
import jwt from "jsonwebtoken";
// import { validateRequest } from "../middlewares/validate-request";
import { validateRequest } from "@testtickets1221/common";


const router = express.Router();

router.post(
  "/api/users/signup",
  [
    // it makes these fields required by default
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }
    // console.log("creating a user");
    // throw new DatabaseConnectionError();
    // // return next(new DatabaseConnectionError());
    // // await fs.readFile("maaa")

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = User.build({ email, password });
    await user.save();

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY! // so we already check if its available before starting up server so here we tell typescript to just chill
    );

    req.session = {
      // cookie session is going to take it, serialize and send it back to users browser
      // type definition of cookie sessions doesnt assume req.session is an object so tahts why we write it here
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };

// so basically when its async without express-async-errors package we must throw errors with next not with throw
// async(req: Request, res: Response, next: NextFunction) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       throw new RequestValidationError(errors.array());
//     }
//     console.log("creating a user");
//     throw new DatabaseConnectionError();
//     // await fs.readFile("maaa")
//     console.log("here")
//     // await fs.readFile("./maaaa")
//     const { email, password } = req.body;
//     res.send("Current user");
//   } catch (error) {
//     console.log("here fir syre");
//     next(error)
//   }
// }
