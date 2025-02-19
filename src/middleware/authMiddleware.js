import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret"; // Use env variable in production

function authenticateToken(req, res, next) {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = decoded; // Add user info to request object
        next(); // Move to the next middleware
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
}

export default authenticateToken;
