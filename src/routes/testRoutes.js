import express from 'express';
import db from '../db/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM testtable');
        console.log("exexuted");
        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}); 

export default router;
