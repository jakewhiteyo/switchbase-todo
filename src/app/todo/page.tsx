"use client";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

export default function TodoPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 bg-white p-10 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Todo</h1>
    </div>
  );
}
