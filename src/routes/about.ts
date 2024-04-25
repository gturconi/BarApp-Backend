import express from 'express';
import { getContact, putContact, postContact, postEmailMessage } from '../about/controllers/about';

const router = express.Router();

router.get('/', getContact);
router.post('/', postContact);
router.post('/message', postEmailMessage);
router.put('/:id', putContact);

export default router;
