import express from 'express';

import { isAdmin, verifyToken } from '../middlewares/authJwt';

import { getMostSelledProdcuts } from '../metric/controllers/metric';

const router = express.Router();

router.get(
  '/most-selled-products',
  [verifyToken, isAdmin],
  getMostSelledProdcuts
);

export default router;
