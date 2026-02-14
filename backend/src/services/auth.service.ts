import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { AppError } from "../types";
import { generateToken } from "../utils/jwt";

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
}
