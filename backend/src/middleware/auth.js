import jwt from 'jsonwebtoken';
import config from '../config/index.js';

// Middleware to verify a token and respond with user information
export const authenticateToken = (req, res, next) => {
    // We are using Bearer auth.  The token is in the authorization header.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('JSON web token missing.');
        return res.sendStatus(401);
    }

    // Check that the token is valid
    try {
        const user = jwt.verify(token, config.jwt.secret);
        console.log(user)
        console.log(`authToken verified for user: ${user.username} at URL ${req.url}`);

        // Add user info to the request for the next handler
        req.user = user;
        next();
    } catch (err) {
        console.log(`JWT verification failed at URL ${req.url}`, err.name, err.message);
        return res.sendStatus(401);
    }
}

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
    console.log(`Admin verification initiated for user:`, req.user);
    if (req.user.user && req.user.user.admin) {
        next();
    } else {
        console.log(`Admin verification failed at URL ${req.url}`);
        return res.sendStatus(403);
    }
};