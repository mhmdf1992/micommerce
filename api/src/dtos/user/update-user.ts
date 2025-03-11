import { Role } from "../../data/models/user";

export interface IUpdateUser{
    password: string;
    firstname: string;
    lastname: string;
    role: Role;
    disabled: boolean;
}