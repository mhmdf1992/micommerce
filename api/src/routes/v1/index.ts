import express from 'express';
import { userRoutes } from './user';
import { logRoutes } from './log';
import { authRoutes } from './auth';
import { adminAuth } from '../../middlewares/admin-auth';
export const routes = express.Router();
routes.use('/auth', authRoutes);
routes.use('/users', adminAuth, userRoutes);
routes.use('/logs', adminAuth, logRoutes);
