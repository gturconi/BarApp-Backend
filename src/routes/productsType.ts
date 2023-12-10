import express from "express";

import {
  getProductsType,
  getProductType,
  updateProductType,
  deleteProductType,
  insertProductType
} from "../product-type/controllers/productType";

//import validatorUser from "../user/validators/user";
//import { isAdmin, verifyToken } from "../middlewares/authJwt";

const router = express.Router();

router.get("/", /*verifyToken,*/ getProductsType);
router.get("/:id", /*verifyToken,*/ getProductType);
router.put("/:id", /*[verifyToken, isAdmin], validatorUser,*/ updateProductType);
router.delete("/:id", /*[verifyToken, isAdmin],*/ deleteProductType);
router.post("/", /*[verifyToken, isAdmin],*/ insertProductType);

export default router;
