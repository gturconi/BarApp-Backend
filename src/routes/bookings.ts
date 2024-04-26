import express from 'express';
import {
  getBooking,
  getBookings,
  insertBooking,
} from '../booking/controllers/booking';
import validatorBooking from '../booking/validators/booking';
import { verifyToken } from '../middlewares/authJwt';

const router = express.Router();

router.get('/', verifyToken, getBookings);
router.get('/:id', verifyToken, getBooking);
router.post('/', verifyToken, validatorBooking, insertBooking);

export default router;
