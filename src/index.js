import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import app from './app.js';
import { connectDB } from './db/connect.js';

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connectDB();
        app.on('error', (error) => {
            console.log(error)
        });
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        });
    } catch (error) {
        console.log('something went wrong)', error);         
    }
}

start();