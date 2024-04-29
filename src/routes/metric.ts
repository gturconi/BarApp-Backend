import express from 'express';

import { isAdmin, verifyToken } from '../middlewares/authJwt';

import {
  getMostSelledProdcuts,
  topFiveCustomers,
} from '../metric/controllers/metric';

const router = express.Router();

router.get(
  '/most-selled-products',
  [verifyToken, isAdmin],
  getMostSelledProdcuts
);
router.get('/top-five-customers', [verifyToken, isAdmin], topFiveCustomers);

export default router;
