import express from 'express';
import { signup, confirmSignup, authenticate } from '../../controllers/v1/auth.controller.js';

const router = express.Router();

router.post('/login', authenticate);

router.post('/signup', signup);

router.post('/confirm-signup', confirmSignup);

export default router;