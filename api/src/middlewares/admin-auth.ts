import { Unauthorized } from "../errors/Unauthorized";
import jwt, { JwtPayload } from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        throw new Unauthorized("Token is not valid.")
    jwt.verify(token, req.env.JWT_SECRET, (err: any, user: any) => {
        if(err)
            throw new Unauthorized("Token is not valid.");
        const payload = jwt.decode(token) as JwtPayload;
        if(payload.role !== "admin")
            throw new Unauthorized("Unauthorized Access.");
        next();
    });
}