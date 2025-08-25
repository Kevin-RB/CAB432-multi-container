import { generateAccessToken } from "../../services/auth.js";
import { users } from "../../utils/jwt-utils.js";

export const login = (req, res) => {
    console.log("Attempting login for user", req.body.username);
    // Check the username and password
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const user = users[username];

    if (!user || password !== user.password) {
        return res.status(401).json({ error: "Invalid username or password, please try again" });
    }

    // Get a new authentication token and send it back to the client
    console.log("Successful login by user", username);
    const token = generateAccessToken({ user });
    res.json({ authToken: token });
}