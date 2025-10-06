"use client";

import { useState } from "react";
import Link from "next/link";
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
import { useSignup } from "@/app/hooks/useAuth";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { isLoading, isError, error, signup } = useSignup();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear password error when user starts typing
    if (name === "confirmPassword" || name === "password") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      return;
    }

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      // Error is handled by the hook and displayed via isError/error
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="w-full max-w-md mt-20">
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl text-center">Sign up</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error?.message || "An error occurred during signup"}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className={`h-11 ${
                  passwordError ? "border-red-300 focus:border-red-500" : ""
                }`}
              />
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-sw-new-green focus:ring-sw-new-green border-gray-300 rounded"
              />
              <Label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-sw-new-green hover:text-sw-green"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-sw-new-green hover:text-sw-green"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full h-11 bg-sw-new-green hover:bg-sw-green text-white font-medium disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <span className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-sw-new-green hover:text-sw-green"
            >
              Sign in
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
