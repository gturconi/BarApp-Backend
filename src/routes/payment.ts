import { Router } from 'express';
import { createOrder, receiveWebhook } from '../order/controllers/payment';
const router = Router();

router.post(':id', createOrder);

router.post('/webhook/:id', receiveWebhook);

export default router;
