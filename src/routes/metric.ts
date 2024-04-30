import express from 'express';

import { isAdmin, verifyToken } from '../middlewares/authJwt';

import {
  getMostSelledProdcuts,
  topFiveCustomers,
  weeklySalesHistory,
} from '../metric/controllers/metric';

const router = express.Router();

router.get(
  '/most-selled-products',
  [verifyToken, isAdmin],
  getMostSelledProdcuts
);
router.get('/top-five-customers', [verifyToken, isAdmin], topFiveCustomers);

router.get('/weekly-sales-history', [verifyToken, isAdmin], weeklySalesHistory);

export default router;
