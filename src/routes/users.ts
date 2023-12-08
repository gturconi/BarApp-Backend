import express from "express";

import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../user/controllers/user";
import validatorUser from "../user/validators/user";
import { isAdmin, verifyToken } from "../middlewares/authJwt";

const router = express.Router();

router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUser);
router.put("/:id", [verifyToken, isAdmin], validatorUser, updateUser);
router.delete("/:id", [verifyToken, isAdmin], deleteUser);

export default router;
