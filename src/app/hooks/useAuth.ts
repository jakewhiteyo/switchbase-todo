import { useMutation } from "@tanstack/react-query";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface SigninData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

export const useSignup = () => {
  const router = useRouter();

  const { isPending, isError, error, mutateAsync } = useMutation<
    AuthResponse,
    Error,
    SignupData
  >({
    mutationFn: async (data: SignupData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Signup failed");
      }

      return response.json();
    },
    onSuccess: async (data, variables) => {
      // Auto-signin after successful registration
      const result = await signIn("credentials", {
        email: variables.email,
        password: variables.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Auto-signin failed");
      }

      // Force a page refresh to update the session
      router.refresh();
      router.push("/");
    },
  });

  return {
    isLoading: isPending,
    isError,
    error,
    signup: mutateAsync,
  };
};

export const useSignin = () => {
  const router = useRouter();

  const { isPending, isError, error, mutateAsync } = useMutation<
    AuthResponse,
    Error,
    SigninData
  >({
    mutationFn: async (data: SigninData) => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return { success: true };
    },
    onSuccess: () => {
      // Force a page refresh to update the session
      router.refresh();
      router.push("/");
    },
  });

  return {
    isLoading: isPending,
    isError,
    error,
    signin: mutateAsync,
  };
};

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    logout,
  };
};
