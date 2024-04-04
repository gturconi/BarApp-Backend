import { Router } from 'express';
import { createOrder, receiveWebhook } from '../order/controllers/payment';
import { verifyToken } from '../middlewares/authJwt';

const router = Router();

router.post('/:id', verifyToken, createOrder);

router.post('/webhook/:id', receiveWebhook);

export default router;
