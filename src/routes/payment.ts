import { Router } from 'express';
import { createOrder, receiveWebhook } from '../order/controllers/payment';
const router = Router();

router.post('', createOrder);

router.post('/webhook', receiveWebhook);

export default router;
