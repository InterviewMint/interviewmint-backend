import type { Request, Response, NextFunction } from "express";

type RequestHandler = (req: Request, res: Response, next: NextFunction) => any | Promise<any>;

const asyncHandler = (requestHandler: RequestHandler) => {
    const typedRequestHandler = requestHandler;

    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(typedRequestHandler(req, res, next))
        .catch((err) => next(err))
    }
}

export {asyncHandler}
export type { Request, Response, NextFunction };
