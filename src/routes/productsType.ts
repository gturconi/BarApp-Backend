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

const upload = multer();

const router = express.Router();

router.get("/", getProductsType);
router.get("/:id", getProductType);
router.put("/:id",upload.single("image"), validatorProductType, updateProductType);
router.delete("/:id", deleteProductType);
router.post("/", upload.single("image"),validatorProductType, insertProductType);

export default router;
