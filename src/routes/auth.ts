import { Router } from "express";
import { signinHandler, signupHandler } from "../user/controllers/auth";
import validatorUser from "../user/validators/user";

const router = Router();

router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.post("/signup", validatorUser, signupHandler);

router.post("/signin", validatorUser, signinHandler);

export default router;
