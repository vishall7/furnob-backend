import express from 'express';
import {ErrorHandler} from './utils/ErrorHandler.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 

const app = express();

app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ limit: '16mb', extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ data: true });
});

// route imports
import categoryRoute from './routes/category.route.js';
import brandRoute from './routes/brand.route.js';
import productRoute from './routes/product.route.js';
import userRoute from './routes/user.route.js';
import wishlistRoute from './routes/wishlist.route.js'; 

// route registration

app.use('/api/v1/category', categoryRoute);
app.use('/api/v1/brand', brandRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/wishlist', wishlistRoute);

app.use(ErrorHandler);
export default app;
