import express from "express";
import multer from "multer";

import {
  getProductsType,
  getProductType,
  updateProductType,
  deleteProductType,
  insertProductType,
} from "../product-type/controllers/productType";

import validatorProductType from "../product-type/validators/productsType";
import { isAdmin, verifyToken } from "../middlewares/authJwt";

const upload = multer();

const router = express.Router();

router.get("/", getProductsType);
router.get("/:id", getProductType);
router.post(
  "/",
  [verifyToken, isAdmin],
  upload.single("image"),
  validatorProductType,
  insertProductType
);
router.put(
  "/:id",
  [verifyToken, isAdmin],
  upload.single("image"),
  validatorProductType,
  updateProductType
);
router.delete("/:id", [verifyToken, isAdmin], deleteProductType);

export default router;
