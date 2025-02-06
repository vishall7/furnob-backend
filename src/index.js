import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import app from './app.js';

const PORT = process.env.PORT || 3000;

async function start() {
    try {
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