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
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 w-full">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Login
          </CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full font-semibold">Login</Button>
          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              to={"/register"}
              className="text-primary hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
