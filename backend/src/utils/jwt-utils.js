import crypto from 'crypto';

export const secret = crypto.randomBytes(64).toString('hex');

// Simple hard-coded username and password for demonstration
export const users = {
   CAB432: {
      password: "supersecret",
      admin: false,
   },
   admin: {
      password: "admin",
      admin: true,
   },
};