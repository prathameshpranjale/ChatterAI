import express from "express";
import bodyparser from "body-parser";
import db from "./db/db.js"
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';

// To get the equivalent of __dirname in ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// import dotenv from 'dotenv';
// dotenv.config();
const app = express();
// gloabal middleware
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname,'..','public')))

// // Serve the main HTML page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Make sure this points to the correct path
});


app.use('/api/testtable', testRoutes);
app.use('/api/auth',authRoutes)

// Global error Handler
app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500).json({error:"Internal Server Errorr Hehehe ( ><)(>< )"});
});


export default app;
