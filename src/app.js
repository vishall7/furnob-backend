import express from 'express';
import {ErrorHandler} from './utils/ErrorHandler.js';

const app = express();

app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ limit: '16mb', extended: true }));
app.use(express.static('public'));

app.get('/', (request, response) => {
    return response.json({ message: 'Hello World' });
});

// route imports
import categoryRoute from './routes/category.route.js';
import brandRoute from './routes/brand.route.js';

// route registration

app.use('/api/v1/category', categoryRoute);
app.use('/api/v1/brand', brandRoute);

app.use(ErrorHandler);
export default app;
