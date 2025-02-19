import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../models/userModel.js";
import authenticateToken from "../middleware/authMiddleware.js";
import db from "../db/db.js"


const router = express.Router();
const JWT_SECRET = "your_jwt_secret"; // Use environment variables instead

// User Signup
router.post(
    "/signup",
    [
        body("username").notEmpty().withMessage("Username is required"),
        body("email").isEmail().withMessage("Invalid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;
        try {
            const existingUser = await findUserByEmail(email);
            if (existingUser) return res.status(400).json({ error: "Email already in use" });

            const newUser = await createUser(username, email, password);
            res.status(201).json({ message: "User registered successfully", user: newUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    }
);

// User Login
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await findUserByEmail(email);
            if (!user) return res.status(400).json({ error: "Invalid email or password" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
            res.status(200).json({ message: "Login successful", token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    }
);
// Protected Route: Get User Profile
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await db.query("SELECT id, username, email, created_at FROM users WHERE id = $1", [req.user.id]);

        if (!user.rows.length) return res.status(404).json({ error: "User not found" });

        res.json(user.rows[0]); // Return user profile
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all Users
router.get("/users", authenticateToken, async (req, res) => {
    try {
        const users = await db.query("SELECT id, username, email FROM users WHERE id != $1", [req.user.id]);
        res.json(users.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});



export default router;
