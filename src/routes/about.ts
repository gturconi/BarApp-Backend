import express from 'express';
import { getContact, putContact } from '../about/controllers/about';

const router = express.Router();

router.get('/', getContact);
router.put('/:id', putContact);

export default router;
