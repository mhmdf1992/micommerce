import { Container } from 'inversify';
import 'reflect-metadata';
import { types } from './ioc-types';
import { ILogger, Logger } from './services/logger';
import { IUserService, UserService } from './services/user';
import { MongoClient } from 'mongodb';

const container = new Container();
container.bind<MongoClient>(types.MongoClient).toDynamicValue(() => new MongoClient(process.env.DB_URI)).inSingletonScope();
container.bind<ILogger>(types.Logger).toDynamicValue((context) => new Logger(context.get(types.MongoClient))).inSingletonScope();
container.bind<IUserService>(types.UserService).toDynamicValue((context) => new UserService(context.get(types.MongoClient), process.env.JWT_SECRET)).inSingletonScope();
export {container}
