import express from 'express';
import multer from 'multer';

import { getRoles } from '../role/controllers/role';

const router = express.Router();

router.get('/', getRoles);

export default router;
