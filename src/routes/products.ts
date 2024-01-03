import express from "express";
import multer from "multer";

import {
  getProducts,
  getProduct,
  insertProduct,
  updateProduct,
} from "../product/controllers/product";

import validatorProduct from "../product/validators/product";
import { isAdmin, verifyToken } from "../middlewares/authJwt";

const upload = multer();
const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", upload.single("image"), validatorProduct, insertProduct);
router.put("/:id", upload.single("image"), validatorProduct, updateProduct);

export default router;
