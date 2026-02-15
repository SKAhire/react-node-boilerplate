import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  // Register User
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email and Password are required.",
        });
        return;
      }

      const result = await authService.register({ name, email, password });

      res.status(201).json({
        success: true,
        data: result,
        message: "User Registered successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  // Login User
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email and Password are required.",
        });
        return;
      }

      const result = await authService.login({ email, password });
      res.status(200).json({
        success: true,
        data: result,
        message: "Login Successful.",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;

      // Validate required field
      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email is required",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: "Invalid email format",
        });
        return;
      }

      const result = await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token, password } = req.body;

      // Validate required fields
      if (!token || !password) {
        res.status(400).json({
          success: false,
          error: "Token and new password are required",
        });
        return;
      }

      const result = await authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
