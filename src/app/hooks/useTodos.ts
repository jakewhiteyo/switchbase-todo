import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Priority } from "@/generated/prisma";

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: Date | string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
  dueDate?: Date | string | null;
}

export interface TodoFilters {
  completed?: boolean;
  priority?: Priority;
}

// Hook to fetch all todos with optional filters
export const useTodos = (filters?: TodoFilters) => {
  const queryKey = ["todos", filters];

  const { data, isLoading, isError, error, refetch } = useQuery<Todo[], Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.completed !== undefined) {
        params.append("completed", String(filters.completed));
      }

      if (filters?.priority) {
        params.append("priority", filters.priority);
      }

      const url = `/api/todos${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch todos");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    todos: data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to fetch a single todo by ID
export const useTodo = (id: string | null) => {
  const { data, isLoading, isError, error, refetch } = useQuery<Todo, Error>({
    queryKey: ["todo", id],
    queryFn: async () => {
      if (!id) throw new Error("Todo ID is required");

      const response = await fetch(`/api/todos/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch todo");
      }

      return response.json();
    },
    enabled: !!id, // Only run query if id is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    todo: data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to create a new todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutateAsync, mutate } = useMutation<
    Todo,
    Error,
    CreateTodoData
  >({
    mutationFn: async (data: CreateTodoData) => {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create todo");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all todos queries to refetch
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return {
    isLoading: isPending,
    isError,
    error,
    createTodo: mutateAsync,
    createTodoSync: mutate,
  };
};

// Hook to update a todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutateAsync, mutate } = useMutation<
    Todo,
    Error,
    { id: string; data: UpdateTodoData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update todo");
      }

      return response.json();
    },
    onSuccess: (updatedTodo) => {
      // Invalidate todos queries to refetch
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      // Update the specific todo in cache
      queryClient.invalidateQueries({ queryKey: ["todo", updatedTodo.id] });
    },
  });

  return {
    isLoading: isPending,
    isError,
    error,
    updateTodo: mutateAsync,
    updateTodoSync: mutate,
  };
};

// Hook to delete a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutateAsync, mutate } = useMutation<
    { message: string },
    Error,
    string
  >({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete todo");
      }

      return response.json();
    },
    onSuccess: (_, deletedId) => {
      // Invalidate todos queries to refetch
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      // Remove the specific todo from cache
      queryClient.removeQueries({ queryKey: ["todo", deletedId] });
    },
  });

  return {
    isLoading: isPending,
    isError,
    error,
    deleteTodo: mutateAsync,
    deleteTodoSync: mutate,
  };
};

// Hook to toggle todo completion status
export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutateAsync, mutate } = useMutation<
    Todo,
    Error,
    { id: string; completed: boolean }
  >({
    mutationFn: async ({ id, completed }) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle todo");
      }

      return response.json();
    },
    onSuccess: (updatedTodo) => {
      // Invalidate todos queries to refetch
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      // Update the specific todo in cache
      queryClient.invalidateQueries({ queryKey: ["todo", updatedTodo.id] });
    },
  });

  return {
    isLoading: isPending,
    isError,
    error,
    toggleTodo: mutateAsync,
    toggleTodoSync: mutate,
  };
};
