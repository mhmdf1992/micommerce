import { ObjectId } from "mongodb";

export interface ITenant{
    _id: ObjectId;
    name: string;
    metadata: {
    };
}