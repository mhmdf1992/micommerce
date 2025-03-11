declare module "express-serve-static-core" {
    interface Response{
      body?: (body?) => void
    }
}