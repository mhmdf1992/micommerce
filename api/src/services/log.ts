import { MongoClient, ObjectId } from "mongodb";
import { ILogItem } from "../data/models/log-item";
import { injectable } from "inversify";

export interface ILogService{
    log(type: string, message: string, metadata: any): Promise<ObjectId>;
}
@injectable()
export class LogService implements ILogService{
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