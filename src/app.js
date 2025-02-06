import express from 'express';

const app = express();

app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ limit: '16mb', extended: true }));
app.use(express.static('public'));

app.get('/', (request, response) => {
    return response.json({ message: 'Hello World' });
});

export default app;
