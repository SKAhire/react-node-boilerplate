import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";

interface PrismaError extends Error {
  code?: string;
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle Prisma known errors
  const prismaErr = err as PrismaError;
  if (err.name === "PrismaClientKnownRequestError" && prismaErr.code) {
    // Unique constraint violation
    if (prismaErr.code === "P2002") {
      res.status(409).json({
        success: false,
        error: "A record with this value already exists",
      });
      return;
    }

    // Record not found
    if (prismaErr.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Record not found",
      });
      return;
    }
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: "Token expired",
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
};
