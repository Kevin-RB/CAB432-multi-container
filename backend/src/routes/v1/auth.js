import express from 'express';
import { signup, confirmSignup, authenticate, loginWithGoogle, googleCallback, verifyTotpAndFinishSetup } from '../../controllers/v1/auth.controller.js';

const router = express.Router();

router.post('/login', authenticate);

router.post('/signup', signup);

router.post('/verify-totp', verifyTotpAndFinishSetup);

router.post('/confirm-signup', confirmSignup);

router.get('/google', loginWithGoogle)

router.get('/google/callback', googleCallback);

export default router;