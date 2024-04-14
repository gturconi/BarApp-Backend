import express from 'express';
import { getQrs, generateQrs } from '../qr/controller/qr';
import { isAdmin, verifyToken } from '../middlewares/authJwt';

const router = express.Router();

router.get('/', /*[verifyToken, isAdmin],*/ getQrs);
router.post('/', /* [verifyToken, isAdmin], */ generateQrs);

export default router;
