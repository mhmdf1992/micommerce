import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error-handler';
import { cors } from './middlewares/cors';
import { routes } from './routes/v1';
import { successHandler } from './middlewares/success-handler';
dotenv.config();
const app = express();
app.use(successHandler);
app.use(express.json());
app.use(cors);
app.use('/api/v1', routes);
app.use(errorHandler);
app.listen(process.env.PORT, () => {
  return console.log(`Express is listening at http://localhost:${process.env.PORT}`);
});