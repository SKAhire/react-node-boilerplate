import { Router } from "express";
import { AuthController } from "../controller/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

router.post("/login", (req, res, next) => authController.login(req, res, next));
/**
 * POST /api/auth/forgot-password
 * Request password reset (public)
 */
router.post("/forgot-password", (req, res, next) =>
  authController.forgotPassword(req, res, next),
);

/**
 * POST /api/auth/reset-password
 * Reset password with token (public)
 */
router.post("/reset-password", (req, res, next) =>
  authController.resetPassword(req, res, next),
);
export default router;
