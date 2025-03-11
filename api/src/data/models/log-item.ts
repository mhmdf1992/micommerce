import { ObjectId } from "mongodb";

export interface ILogItem{
    _id: ObjectId;
    type: string;
    created_on: Date;
    message: string;
    tenant_id: string
    metadata:{
        
    };
}