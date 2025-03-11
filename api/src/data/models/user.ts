import { ObjectId } from "mongodb";

export interface IUser{
    _id: ObjectId;
    username: string;
    password: string;
    firstname: string;
    lastname: string;
    created_on: Date;
    metadata: {
        role: Role;
        disabled: boolean;
    };
}

export type Role = 'admin' | 'custom' | 'customer';