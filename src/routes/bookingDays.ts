import express from 'express';

import validatorBookingDay from '../booking/validators/bookingDay';
import {
  deleteBookingDay,
  getBookingDay,
  getBookingDays,
  insertBookingDay,
  updateBookingDay,
} from '../booking/controllers/bookingDay';

import { verifyToken, isAdmin } from '../middlewares/authJwt';

const router = express.Router();

router.get('/', verifyToken, getBookingDays);
router.get('/:id', verifyToken, getBookingDay);
router.post('/', [verifyToken, isAdmin], validatorBookingDay, insertBookingDay);
router.put(
  '/:id',
  [verifyToken, isAdmin],
  validatorBookingDay,
  updateBookingDay
);
router.delete('/:id', [verifyToken, isAdmin], deleteBookingDay);

export default router;
