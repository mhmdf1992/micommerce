import { MongoClient } from "mongodb";
import { Logger } from "../services/logger";
import { UserService } from "../services/user";

declare module "express-serve-static-core" {
    interface Response{
      body?: (body?) => void
    }
}