import { MongoClient, ObjectId } from "mongodb";
import { IUser } from "../data/models/user";
import { ArgumentError } from "../errors/argument";
import { ICreateUser } from "../dtos/user/create-user";
import { IPagedList } from "../dtos/paged-list";
import { IFilter } from "../dtos/filter";
import { AggregateBuilder } from "../data/helpers/aggregate-builder";
import { IUpdateUser } from "../dtos/user/update-user";
import { NotFound } from "../errors/not-found";
import { Unauthorized } from "../errors/unauthorized";
import { ILoginResponse } from "../dtos/auth/login-response";
import jwt from 'jsonwebtoken';
import { injectable } from "inversify";

export interface IUserService{
    authenticate(username: string, password: string): Promise<ILoginResponse>;
    usernameExists(username: string): Promise<boolean>;
    exists(id: string): Promise<boolean>;
    get(id: string): Promise<IUser>;
    getMany(filter: IFilter): Promise<IPagedList<IUser>>;
    delete(id: string): Promise<void>;
    update(id: string, user: IUpdateUser): Promise<void>;
    replace(id: string, user: IUpdateUser): Promise<void>;
    create(user: ICreateUser): Promise<ObjectId>;
}

@injectable()
export class UserService implements IUserService{
    protected _mongoClient: MongoClient;
    protected _jwtSecret: string;
    
    constructor(mongoClient: MongoClient, jwtSecret: string){
        this._mongoClient = mongoClient;
        this._jwtSecret = jwtSecret;
    }

    public authenticate = async (username: string, password: string): Promise<ILoginResponse> => {
        const user =
         await this.
            _mongoClient
                .db("cms")
                .collection("users")
                .findOne({ username: username }, { projection: { "_id": 1, "username": 1, "password": 1, "metadata.role": 1 } });
        if(!user || password !== user.password)
            throw new Unauthorized("Username or password is incorrect.");
        const token = jwt.sign(
            { 
                _id: user._id, 
                username: user.username,
                role: user.metadata.role
            },
            this._jwtSecret,
            {
              expiresIn: "360d",
            }
        );
        const res: ILoginResponse = {
            token: token
        }
        return res;
    }

    public usernameExists = async (username: string): Promise<boolean> => {
        const user = 
         await this.
            _mongoClient
                .db("cms")
                .collection("users")
                .findOne({ username: username }, { projection: {"_id": 1} });
        return !user || !user._id ? false : true;
    }

    public exists = async (id: string): Promise<boolean> => {
        const user = 
         await this.
            _mongoClient
                .db("cms")
                .collection("users")
                .findOne({ _id: ObjectId.createFromHexString(id) }, { projection: {"_id": 1} });
        return !user ? false : true;
    }

    public get = async (id: string): Promise<IUser> => {
        const user = 
         await this.
            _mongoClient
                .db("cms")
                .collection<IUser>("users")
                .findOne({ _id: ObjectId.createFromHexString(id) });
        return user;
    }

    public getMany = async (filter: IFilter): Promise<IPagedList<IUser>> =>{
        const aggregate = AggregateBuilder.build(filter);
        const result = 
         await this.
            _mongoClient
                .db("cms")
                .collection<IUser>("users")
                .aggregate(aggregate)
                .toArray();
        const pagedList: IPagedList<IUser> = {
            items: result[0].data,
            page: filter.page,
            page_size: filter.page_size,
            total_items: result[0].data.length == 0 ? 0 : result[0].metadata[0].total,
            total_pages: result[0].data.length == 0 ? 0 : Math.ceil(result[0].metadata[0].total / filter.page_size) | 0
        }
        return pagedList;
    }

    public delete = async (id: string): Promise<void> => {
         await this.
            _mongoClient
                .db("cms")
                .collection("users")
                .deleteOne({ _id: ObjectId.createFromHexString(id) });
    }

    public update = async (id: string, user: IUpdateUser): Promise<void> => {
        const set: any = {};
        if(user.firstname)
            set.firstname = user.firstname;
        if(user.lastname)
            set.lastname = user.lastname;
        if(user.password){
            UserService.validatePassword(user.password);
            set.password = user.password;
        }
        if(user.role)
            set.metadata.role = user.role;
        if(user.disabled === false || user.disabled === true)
            set.metadata.disabled = user.disabled;
        await this.
         _mongoClient
            .db("cms")
            .collection("users")
            .updateOne({ _id: ObjectId.createFromHexString(id) }, {$set: set});
    }

    public replace = async (id: string, user: IUpdateUser): Promise<void> => {
        const oldUser =
         await this.
            _mongoClient
                .db("cms")
                .collection("users")
                .findOne({ _id: ObjectId.createFromHexString(id) }, { projection: {"username": 1} });
        if(!oldUser)
            throw new NotFound("User does not exists");
        const newUser: IUser = {
            _id: ObjectId.createFromHexString(id),
            firstname: user.firstname,
            lastname: user.lastname,
            username: oldUser.username,
            password: user.password,
            created_on: new Date(),
            metadata: {
                role: user.role,
                disabled: user.disabled
            }
        };
        await this.
         _mongoClient
            .db("cms")
            .collection<IUser>("users")
            .replaceOne({ _id: ObjectId.createFromHexString(id) }, newUser);
    }

    public create = async (user: ICreateUser): Promise<ObjectId> => {
        const newUser: IUser = {
            _id: null,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            password: user.password,
            created_on: new Date(),
            metadata: {
                role: user.role,
                disabled: user.disabled
            }
        };
        await this.
         _mongoClient
            .db("cms")
            .collection("users")
            .insertOne(newUser);
        return newUser._id;
    }
    
    public static isValidUsername = (username: string): boolean => 
        /^[a-z][a-z0-9_.]{6,24}$/.test(username);

    public static isValidPassword = (password: string): boolean => 
        /[a-zA-Z0-9_.@$]{6,24}$/.test(password);

    public static validateUsername = (username: string) =>{
        if(!UserService.isValidUsername(username))
            throw new ArgumentError("username", "Username is not valid. Username must start with a letter minimum 6 and maximum 24 characters. Allowed characters are a-z (only lower case), 0-9, '_' (underscore) and '.' (dot).");
    }
    
    public static validatePassword = (password: string) =>{
        if(!UserService.isValidPassword(password))
            throw new ArgumentError("password", "Password is not valid. Password should be minimum 6 charecters and maximum 24. Allowed characters are a-z, A-Z, 0-9, '@', '$', '_' and '.'");
    }

    public static isValidId = (id: string) => ObjectId.isValid(id);

    public static validateId = (id: string) =>{
        if(!UserService.isValidId(id))
            throw new ArgumentError("id", "Id is not valid.");
    }
}