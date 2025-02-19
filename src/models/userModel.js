import db from "../db/db.js";
import bcrypt from "bcryptjs";

async function createUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3) RETURNING id, username, email;
    `;
    const values = [username, email, hashedPassword];
    const result = await db.query(query, values);
    return result.rows[0]; // Return created user (without password)
}

async function findUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);
    return result.rows[0]; // Return user if found
}

export { createUser, findUserByEmail };
