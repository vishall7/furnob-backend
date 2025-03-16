import './config/config.js';
import app from './app.js';
import { connectDB } from './db/connect.js';
import { agendaStart } from './db/agenda.js';

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connectDB();
        await agendaStart();
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