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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(authMiddleware);

app.use('/api', userRouter);
app.use('/api', currencyRouter);

app.get('/', (req, res) => res.redirect('/api-docs'));

app.listen(PORT, () => {
  console.log(`\nServer started`);
  console.log(`Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`User Profile:  http://localhost:${PORT}/api/user`);
  console.log(`Currencies:    http://localhost:${PORT}/api/currencies`);
  console.log(`Rates Example: http://localhost:${PORT}/api/rates?targets=EUR,RUB`);
});