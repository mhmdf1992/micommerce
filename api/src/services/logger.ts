import { MongoClient, ObjectId } from "mongodb";
import { ILogItem } from "../data/models/log-item";
import { inject, injectable } from "inversify";
import { types } from "../ioc-types";

export interface ILogger{
    log(type: string, message: string, metadata: any): Promise<ObjectId>;
}
@injectable()
export class Logger implements ILogger{
    _mongoClient: MongoClient;
    constructor(mongoClient: MongoClient){
        this._mongoClient = mongoClient;
    }
    public log = async (type: string, message: string, metadata: any): Promise<ObjectId> =>{
        const logItem: ILogItem = {
            _id: null,
            type: type,
            message: message,
            metadata: metadata,
            created_on: new Date()
        };
        await this._mongoClient
            .db("cms")
            .collection("logs")
            .insertOne(logItem);
        return logItem._id;
    }
};