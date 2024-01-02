import express from "express";
import multer from "multer";

import { getProducts } from "../product/controllers/product";

import validatorProduct from "../product/validators/product";
import { isAdmin, verifyToken } from "../middlewares/authJwt";

const upload = multer();
const router = express.Router();

router.get("/", getProducts);

export default router;
