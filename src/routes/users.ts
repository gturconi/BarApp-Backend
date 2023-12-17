import express from "express";
import multer from "multer";

import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePasswords,
} from "../user/controllers/user";
import validatorUser from "../user/validators/user";
import { isAdmin, verifyToken } from "../middlewares/authJwt";

const upload = multer();
const router = express.Router();

router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUser);
router.put(
  "/:id",
  [verifyToken, isAdmin],
  upload.single("avatar"),
  validatorUser,
  updateUser
);
router.put(
  "/change-password/:id",
  [verifyToken],
  validatorUser,
  changePasswords
);
router.delete("/:id", [verifyToken, isAdmin], deleteUser);

export default router;
