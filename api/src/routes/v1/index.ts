import express from 'express';
import { userRoutes } from './user-routes';
import { logRoutes } from './log-routes';
import { authRoutes } from './auth-routes';
import { adminAuth } from '../../middlewares/admin-auth';
export const routes = express.Router();
routes.use('/auth', authRoutes);
routes.use('/users', adminAuth, userRoutes);
routes.use('/logs', adminAuth, logRoutes);
