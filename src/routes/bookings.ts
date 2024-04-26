import express from 'express';
import {
  getBooking,
  getBookings,
  getFutureBookings,
  insertBooking,
} from '../booking/controllers/booking';
import validatorBooking from '../booking/validators/booking';
import {
  isAdminOrEmployee,
  validateUserOrAdmin,
  verifyToken,
} from '../middlewares/authJwt';

const router = express.Router();

router.get('/', [verifyToken, isAdminOrEmployee], getBookings);
router.get('/:id', [verifyToken, validateUserOrAdmin], getBooking);
router.get('/user/:id', verifyToken, getFutureBookings);
router.post('/', verifyToken, validatorBooking, insertBooking);

export default router;
