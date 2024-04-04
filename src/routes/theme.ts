import express from "express";
import { getTheme, updateTheme } from "../theme/controllers/theme";
import { isAdmin, verifyToken } from "../middlewares/authJwt";

const router = express.Router();

router.get("/:id", getTheme);
router.put("/:id", [verifyToken, isAdmin], updateTheme);

export default router;
