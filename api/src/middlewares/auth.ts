import { Unauthorized } from "../errors/Unauthorized";
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        throw new Unauthorized("Token is not valid.")
    jwt.verify(token, req.env.JWT_SECRET, (err: any, user: any) => {
        if(err)
            throw new Unauthorized("Token is not valid.");
        next();
    });
}