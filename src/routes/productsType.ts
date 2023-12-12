import express from "express";

import {
  getProductsType,
  getProductType,
  updateProductType,
  deleteProductType,
  insertProductType,
} from "../product-type/controllers/productType";

import validatorProductType from "../product-type/validators/productsType";


const router = express.Router();

router.get("/",  getProductsType);
router.get("/:id",  getProductType);
router.put(
  "/:id",
  validatorProductType,
  updateProductType
);
router.delete("/:id", deleteProductType);
router.post(
  "/",
  validatorProductType,
  insertProductType
);

export default router;
