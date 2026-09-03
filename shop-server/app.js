import compression from 'compression'; import cors from 'cors'; import express from 'express'; import helmet from 'helmet'; import morgan from 'morgan';
import { env } from './config/env.js'; import { errorHandler, notFound } from './middleware/errors.js'; import catalogRoutes from './routes/catalogRoutes.js'; import contactRoutes from './routes/contactRoutes.js'; import orderRoutes from './routes/orderRoutes.js';

export const app = express();
app.set('trust proxy', 1); app.disable('x-powered-by'); app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); app.use(cors({ origin: env.frontendUrl.split(',').map((item) => item.trim()), methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] })); app.use(compression()); app.use(express.json({ limit: '100kb' })); app.use(express.urlencoded({ extended: false, limit: '100kb' })); if (env.nodeEnv !== 'test') app.use(morgan('combined'));
app.get('/api/health', (request, response) => response.json({ success: true, service: 'natpe-thunai-api', timestamp: new Date().toISOString() })); app.use('/api', catalogRoutes); app.use('/api', orderRoutes); app.use('/api', contactRoutes); app.use(notFound); app.use(errorHandler);
