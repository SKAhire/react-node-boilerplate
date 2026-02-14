// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// JWT payload structure
export interface JWTPayload {
  userId: number;
  email: string;
}
