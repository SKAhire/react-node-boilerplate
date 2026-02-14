import { NextFunction } from "express";
import { AppError, AuthRequest } from "../types";
import { verifyToken } from "src/utils/jwt";

export const Authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // @ts-ignore
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startswith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    if (!decoded) {
      throw new AppError("Invalid or Expired Token", 401);
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Authentication Failed!", 401));
    }
  }
};
