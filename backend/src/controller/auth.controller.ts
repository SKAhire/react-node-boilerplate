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
}
