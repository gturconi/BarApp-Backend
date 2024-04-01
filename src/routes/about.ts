import express from 'express';
import { getContact } from '../about/controllers/about';

const router = express.Router();

router.get('/', getContact);

export default router;
