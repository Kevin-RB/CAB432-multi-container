import { idVerifier } from '../services/auth.js';

// Middleware to verify a token and respond with user information
export const authenticateToken = async (req, res, next) => {
    // We are using Bearer auth.  The token is in the authorization header.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('JSON web token missing.');
        return res.sendStatus(401);
    }

    // Check that the token is valid
    try {
        const response = await idVerifier(token);
        const isEmailVerified = response.email_verified === true;

        if (!isEmailVerified) {
            console.log('Email not verified for user:', response.username);
            return res.status(403).json({ error: "Email not verified" });
        }
        // Add user info to the request for the next handler
        req.user = {
            username: response['cognito:username'],
            email: response.email,
            userId: response.sub,
            roles: response['cognito:groups'] || [],
        };
        next();
    } catch (err) {
        console.log(`JWT verification failed at URL ${req.url}`, err.name, err.message);
        return res.sendStatus(401);
    }
}

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.roles.includes("admin")) {
        next();
    } else {
        console.log("Forbidden: Admins only");
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
};