import express from 'express';
import multer from 'multer';

import {
  getPromotions,
  getPromotion,
  insertPromotion,
  updatePromotion,
  deletePromotion,
} from '../promotion/controllers/promotion';

import { isAdmin, verifyToken } from '../middlewares/authJwt';
import validatorPromotion from '../promotion/validators/promotion';

const upload = multer();
const router = express.Router();

router.get('/', getPromotions);
router.get('/:id', getPromotion);
router.post(
  '/',
  //[verifyToken, isAdmin],
  upload.single('image'),
  validatorPromotion,
  insertPromotion
);

router.put(
  '/:id',
  //[verifyToken, isAdmin],
  upload.single('image'),
  validatorPromotion,
  updatePromotion
);

router.delete('/:id', /*[verifyToken, isAdmin],*/ deletePromotion);

export default router;
