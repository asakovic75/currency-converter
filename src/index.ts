import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { authMiddleware } from './middleware/auth.js';
import userRouter from './routes/user.js';
import currencyRouter from './routes/currency.js';

dotenv.config();
const app = express();
const PORT = 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Currency Converter API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./src/routes/*.ts'], 
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(authMiddleware);

app.use('/api', userRouter);
app.use('/api', currencyRouter);

app.listen(PORT, () => {
  console.log(`\nServer started and running at:`);
  console.log(`Interface (Dashboard): http://localhost:${PORT}/`);
  console.log(`Documentation (Docs):  http://localhost:${PORT}/api-docs`);
});