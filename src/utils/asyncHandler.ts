interface Request { [key: string]: any }
interface Response { [key: string]: any }
interface NextFunction { (err?: any): void }
type RequestHandler = (req: Request, res: Response, next: NextFunction) => any | Promise<any>;

const asyncHandler = (requestHandler: RequestHandler) => {
    const typedRequestHandler = requestHandler;

    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(typedRequestHandler(req, res, next))
        .catch((err) => next(err))
    }
}

export {asyncHandler}
