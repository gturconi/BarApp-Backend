import express from 'express';
import multer from 'multer';

import { getTables, getTable } from '../table/controllers/table';

import validatorProductType from '../product-type/validators/productsType';
import { isAdmin, verifyToken } from '../middlewares/authJwt';

const upload = multer();

const router = express.Router();

router.get('/', getTables);
router.get('/:id', getTable);

export default router;
