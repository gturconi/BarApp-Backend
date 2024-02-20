import express from 'express';
import multer from 'multer';

import {
  getTables,
  getTable,
  insertTable,
  updateTable,
} from '../table/controllers/table';

import validatorTable from '../table/validators/table';
import { isAdmin, verifyToken } from '../middlewares/authJwt';

const upload = multer();

const router = express.Router();

router.get('/', getTables);
router.get('/:id', getTable);
router.post('/', [verifyToken, isAdmin], validatorTable, insertTable);
router.put('/:id', [verifyToken, isAdmin], validatorTable, updateTable);

export default router;
