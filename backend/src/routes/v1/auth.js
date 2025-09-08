import express from 'express';
import { login, signup, confirmSignup } from '../../controllers/v1/auth.controller.js';

const router = express.Router();

router.post('/login', login);

router.post('/signup', signup);

router.post('/confirm-signup', confirmSignup);

export default router;