import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed } from "lucide-react";

import { useAuth } from "@/context/auth-context";

// Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
// const passwordValidation = new RegExp(
//   /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
// );

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name should atleast be of 3 characters")
      .max(100, "Name is too long."),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required!"),
    password: z
      .string()
      .min(1, "Password is required!")
      .min(8, "Password should be atleast of 8 characters.")
      .regex(/[A-Z]/, "Password must contain one uppercase letter!")
      .regex(/[a-z]/, "Password must contain one lowercase letter!")
      .regex(/[0-9]/, "Password must contain one number"),
    cpassword: z.string().min(1, "Please Confirm your password!"),
  })
  .refine((data) => data.password === data.cpassword, {
    message: "Password don't match",
    path: ["cpassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showCpassword, setShowCpassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log("happend");
    setServerError("");
    setLoading(true);
    try {
      // eslint-disable-next-line
      const { cpassword, ...registerData } = data;

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Registration Failed!");
      }

      // Use AuthContext to store token and user info
      login(result.data.token, result.data.user);

      navigate("/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "An error occured!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 w-full">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information below to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {serverError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="John Doe"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent! p-0!"
                >
                  {showPassword ? (
                    <Eye className="bg-none" size={24} />
                  ) : (
                    <EyeClosed className="bg-none" size={24} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="cpassword"
                  type={showCpassword ? "text" : "password"}
                  {...register("cpassword")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCpassword(!showCpassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent! p-0!"
                >
                  {showCpassword ? (
                    <Eye className="bg-none" size={24} />
                  ) : (
                    <EyeClosed className="bg-none" size={24} />
                  )}
                </button>
              </div>

              {errors.cpassword && (
                <p className="text-sm text-red-500">
                  {errors.cpassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 my-4">
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to={"/login"}
                className="text-primary hover:underline font-medium"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
