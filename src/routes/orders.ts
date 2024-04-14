import express from 'express';

import {
  getOrders,
  getOrder,
  createOrder,
  deleteOrder,
  updateOrderState,
  getUserOrders,
  getLastOrderFromTable,
} from '../order/controllers/order';

import validatorOrder from '../order/validators/order';
import {
  isAdmin,
  validateUserOrAdmin,
  verifyToken,
  isEmployee,
  validateUserOrder,
} from '../middlewares/authJwt';

const router = express.Router();

router.get('/', [verifyToken, isAdmin], getOrders);
router.get('/:id', [verifyToken, validateUserOrder], getOrder);
router.get('/user/:id', [verifyToken, validateUserOrAdmin], getUserOrders);
router.get('/tableOrder/:id', [verifyToken], getLastOrderFromTable);
router.post('/', [verifyToken, validateUserOrder], validatorOrder, createOrder);
router.put('/:id', [verifyToken, isEmployee], validatorOrder, updateOrderState);
router.delete('/:id', [verifyToken, validateUserOrder], deleteOrder);

export default router;
