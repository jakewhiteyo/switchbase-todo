"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900">todo list</h1>
          </Link>
        </div>
        {isLoading ? (
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
        ) : isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <span className="text-md text-sw-new-green font-bold">
              Welcome, {user?.name || user?.email}
            </span>
            <Button
              onClick={logout}
              size="sm"
              className="bg-white text-black hover:bg-gray-100 shadow-none text-md"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/auth/sign-in">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-gray-100 shadow-none text-md"
              >
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
