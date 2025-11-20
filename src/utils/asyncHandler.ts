import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = <P = {}, ResBody = any, ReqBody = any, ReqQuery = {}>(
  requestHandler: RequestHandler<P, ResBody, ReqBody, ReqQuery>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ): void => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };
