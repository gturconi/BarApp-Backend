import express from 'express';
import {
  getTables,
  getTable,
  insertTable,
  updateTable,
  deleteTable,
  updateState,
} from '../table/controllers/table';

import validatorTable from '../table/validators/table';
import { isAdmin, verifyToken } from '../middlewares/authJwt';

const router = express.Router();

router.get('/', [verifyToken], getTables);
router.get('/:id', [verifyToken], getTable);
router.post('/', [verifyToken, isAdmin], validatorTable, insertTable);
router.put('/state/:id', [verifyToken], validatorTable, updateState);
router.put('/:id', [verifyToken, isAdmin], validatorTable, updateTable);
router.delete('/:id', [verifyToken, isAdmin], deleteTable);

export default router;
