import { Router } from "express";
import {
  recoverPasswordHandler,
  resetPassword,
  signinHandler,
  signupHandler,
} from "../user/controllers/auth";
import validatorUser from "../user/validators/user";
import { verifyToken } from "../middlewares/authJwt";

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

router.post("/forgot", recoverPasswordHandler);

router.put("/reset", verifyToken, validatorUser, resetPassword);

export default router;
