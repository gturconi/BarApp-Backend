import express from 'express';
import multer from 'multer';

import { getPromotions } from '../promotion/controllers/promotion';

import { isAdmin, verifyToken } from '../middlewares/authJwt';

const upload = multer();
const router = express.Router();

router.get('/', getPromotions);

export default router;
