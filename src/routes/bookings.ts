import express from 'express';
import {
  cancelBooking,
  confirmBooking,
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
router.put('/cancel/:id', [verifyToken, validateUserOrAdmin], cancelBooking);
router.put('/confirm/:id', [verifyToken, isAdminOrEmployee], confirmBooking);

export default router;
