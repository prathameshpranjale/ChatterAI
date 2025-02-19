import pg  from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const Client = pg.Client;

// const client = new Client({
//     host:"localhost",
//     user:"postgres",
//     port:"8000",
//     password:"12345",
//     database:"postgres"
// });
const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
async function dbConnect(){
    try {
        await client.connect();
        console.log("Connected to DB!!!");

    } catch (error) {
        console.error("Not connected to db", error);
    }
}

const query = (text,params)=> client.query(text,params);

export default {
    dbConnect,
    query
};


