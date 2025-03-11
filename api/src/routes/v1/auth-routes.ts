import express from 'express';
import { ILogin } from '../../dtos/auth/login';
import { container } from '../../ioc-container';
import { IUserService } from '../../services/user';
import { types } from '../../ioc-types';
export const  authRoutes = express.Router();

authRoutes.post('/login', async (req, res, next) => {
    const userService = container.get<IUserService>(types.UserService);
    const user = req.body as ILogin;
    try{
        const response = await userService.authenticate(user.username, user.password);
        res.body(response);
    }catch(err){
        return next(err);
    }
});