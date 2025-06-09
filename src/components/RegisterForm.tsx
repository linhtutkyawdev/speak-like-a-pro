import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import { useAuthActions } from "@convex-dev/auth/react"; // Import useAuthActions
import { Separator } from "@/components/ui/separator"; // Import Separator
import { useConvexAuth } from "convex/react";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const { isLoading } = useConvexAuth();
  const { signIn } = useAuthActions(); // Get signIn function
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    await signIn("password", formData);
    navigate("/dashboard");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Join Speak Like a Pro
        </CardTitle>
        <CardDescription>
          Create your account to start speaking confidently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <Button
            onClick={() => signIn("google", { redirectTo: "/dashboard" })}
            className="w-full bg-white text-gray-700 border border-gray-300 shadow hover:bg-gray-100" // More neutral style
          >
            <img
              src="/google-icon.svg"
              alt="Google icon"
              className="mr-2 h-5 w-5"
            />
            Sign up with Google
          </Button>
          <Separator />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="flow" type="hidden" value="signUp" />
          {/* <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password (min 6 characters)"
              required
            />
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
            />
          </div> */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-700"
          >
            Already have an account? Sign in
          </Button>
        </div>
        {/* Add Google Sign-In Button */}
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
