import jwt from 'jsonwebtoken';
import config from '../config/index.js';

// Create a token with username embedded, setting the validity period.
export const generateAccessToken = (username) => {
    return jwt.sign(username, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}