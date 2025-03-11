import { ObjectId } from "mongodb";

export interface IUser{
    _id: ObjectId;
    username: string;
    password: string;
    firstname: string;
    lastname: string;
    created_on: Date;
    tenant_id: string;
    metadata: {
        role: Role;
        access_routes: string[]
        disabled: boolean;
    };
}

export type Role = 'admin' | 'custom' | 'customer';