import express from 'express';
import { sendNotification } from '../fcm/controllers/fcm';

const router = express.Router();

router.post('/send-notification', sendNotification);

export default router;
