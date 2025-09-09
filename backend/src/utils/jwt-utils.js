import crypto from 'crypto';

export const secret = crypto.randomBytes(64).toString('hex');