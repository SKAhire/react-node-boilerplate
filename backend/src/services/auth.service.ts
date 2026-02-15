import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { AppError } from "../types";
import { generateToken } from "../utils/jwt";
import { generateSecureToken } from "../utils/token";
import { EmailService } from "./email.service";
interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  token: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // User Registration
  async register(data: RegisterData): Promise<AuthResponse> {
    const { name, email, password } = data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    if (password.length < 8) {
      throw new AppError("Password must be atleast 8 characters", 400);
    }

    // Hash Password
    const passwordHash = await hashPassword(password);

    // Create User
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Generate Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user,
    };
  }

  // Login User
  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new AppError("Invaild Email or Password", 401);
    }

    const isValidPassword = comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError("Invaild Email or Password", 401);
    }

    // update last seen
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastSeen: new Date(),
      },
    });

    // Generate Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });
    return {
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
      },
      token,
    };
  }

  /**
   * Request password reset
   * @param email - User's email address
   * @returns Success message
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Delete any existing reset tokens for this user
      await prisma.passwordReset.deleteMany({
        where: { userId: user.id },
      });

      // Generate secure reset token
      const resetToken = generateSecureToken(32);

      // Calculate expiration (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Store reset token in database
      await prisma.passwordReset.create({
        data: {
          email: user.email,
          token: resetToken,
          expiresAt,
          userId: user.id,
        },
      });

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }

    // Return generic message
    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  /**
   * Reset password using token
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Success message
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    // Check if token exists
    if (!resetRecord) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    // Check if token has expired
    if (new Date() > resetRecord.expiresAt) {
      // Delete expired token
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id },
      });
      throw new AppError("Reset token has expired", 400);
    }

    // Validate password length
    if (newPassword.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update user's password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });

    // Delete all reset tokens for this user (invalidate all reset requests)
    await prisma.passwordReset.deleteMany({
      where: { userId: resetRecord.userId },
    });

    return {
      message:
        "Password has been reset successfully. You can now login with your new password.",
    };
  }
}
