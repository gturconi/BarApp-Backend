import express from 'express';

import {
  getOrders,
  getOrder,
  createOrder,
  deleteOrder,
} from '../order/controllers/order';

import validatorOrder from '../order/validators/order';
import {
  isAdmin,
  validateUserOrAdmin,
  verifyToken,
} from '../middlewares/authJwt';

const router = express.Router();

router.get('/', /*[verifyToken, isAdmin],*/ getOrders);
router.get('/:id', /*[verifyToken, validateUserOrAdmin], */ getOrder);
router.post('/', validatorOrder, createOrder);
router.delete('/:id', /* [verifyToken, validateUserOrAdmin], */ deleteOrder);

export default router;
