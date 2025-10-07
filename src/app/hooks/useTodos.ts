import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Priority } from "@/generated/prisma";
import toast from "react-hot-toast";

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
    CreateTodoData,
    { previousTodos: [QueryKey, unknown][] }
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
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

      // Create optimistic todo
      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: newTodo.title,
        description: newTodo.description || null,
        completed: newTodo.completed || false,
        priority: newTodo.priority || "MEDIUM",
        dueDate: newTodo.dueDate
          ? new Date(newTodo.dueDate).toISOString()
          : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "", // Will be set by server
      };

      // Optimistically update all todos queries
      queryClient.setQueriesData(
        { queryKey: ["todos"] },
        (old: Todo[] | undefined) => {
          if (!old) return [optimisticTodo];
          return [optimisticTodo, ...old];
        }
      );

      return { previousTodos };
    },
    onSuccess: (newTodo) => {
      // Replace optimistic todo with real one
      queryClient.setQueriesData(
        { queryKey: ["todos"] },
        (old: Todo[] | undefined) => {
          if (!old) return [newTodo];
          return old.map((todo) =>
            todo.id.startsWith("temp-") ? newTodo : todo
          );
        }
      );

      toast.success("Todo created successfully");
    },
    onError: (error, newTodo, context) => {
      // Revert optimistic update
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to create todo");
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
    { id: string; data: UpdateTodoData },
    { previousTodos: [QueryKey, unknown][]; previousTodo: Todo | undefined }
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
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      await queryClient.cancelQueries({ queryKey: ["todo", id] });

      // Snapshot the previous values
      const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });
      const previousTodo = queryClient.getQueryData(["todo", id]) as
        | Todo
        | undefined;

      // Optimistically update todos queries
      queryClient.setQueriesData(
        { queryKey: ["todos"] },
        (old: Todo[] | undefined) => {
          if (!old) return old;
          return old.map((todo) =>
            todo.id === id
              ? { ...todo, ...data, updatedAt: new Date().toISOString() }
              : todo
          );
        }
      );

      // Optimistically update single todo query
      queryClient.setQueryData(["todo", id], (old: Todo | undefined) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      return { previousTodos, previousTodo };
    },
    onSuccess: (updatedTodo) => {
      // Update with real data from server
      queryClient.setQueriesData(
        { queryKey: ["todos"] },
        (old: Todo[] | undefined) => {
          if (!old) return old;
          return old.map((todo) =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          );
        }
      );

      queryClient.setQueryData(["todo", updatedTodo.id], updatedTodo);

      toast.success("Todo updated successfully");
    },
    onError: (error, { id }, context) => {
      // Revert optimistic updates
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(["todo", id], context.previousTodo);
      }
      toast.error("Failed to update todo");
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
    string,
    { previousTodos: [QueryKey, unknown][]; previousTodo: Todo | undefined }
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
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      await queryClient.cancelQueries({ queryKey: ["todo", id] });

      // Snapshot the previous values
      const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });
      const previousTodo = queryClient.getQueryData(["todo", id]) as
        | Todo
        | undefined;

      // Optimistically remove from todos queries
      queryClient.setQueriesData(
        { queryKey: ["todos"] },
        (old: Todo[] | undefined) => {
          if (!old) return old;
          return old.filter((todo) => todo.id !== id);
        }
      );

      // Remove from single todo query
      queryClient.removeQueries({ queryKey: ["todo", id] });

      return { previousTodos, previousTodo };
    },
    onSuccess: () => {
      // No need to do anything - optimistic update already removed the todo
      toast.success("Todo deleted successfully");
    },
    onError: (error, id, context) => {
      // Revert optimistic updates
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(["todo", id], context.previousTodo);
      }
      toast.error("Failed to delete todo");
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
    { id: string; completed: boolean },
    { previousTodos: [QueryKey, unknown][]; previousTodo: Todo | undefined }
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
    onMutate: async ({ id, completed }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      await queryClient.cancelQueries({ queryKey: ["todo", id] });

      // Snapshot the previous values
      const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });
      const previousTodo = queryClient.getQueryData(["todo", id]) as
        | Todo
        | undefined;

      // Optimistically update todos queries
      queryClient.setQueriesData(
        { queryKey: ["todos"] },
        (old: Todo[] | undefined) => {
          if (!old) return old;
          return old.map((todo) =>
            todo.id === id
              ? { ...todo, completed, updatedAt: new Date().toISOString() }
              : todo
          );
        }
      );

      // Optimistically update single todo query
      queryClient.setQueryData(["todo", id], (old: Todo | undefined) => {
        if (!old) return old;
        return { ...old, completed, updatedAt: new Date().toISOString() };
      });

      return { previousTodos, previousTodo };
    },
    onSuccess: (updatedTodo) => {
      // Update with real data from server
      queryClient.setQueriesData(
        { queryKey: ["todos"] },
        (old: Todo[] | undefined) => {
          if (!old) return old;
          return old.map((todo) =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          );
        }
      );

      queryClient.setQueryData(["todo", updatedTodo.id], updatedTodo);

      toast.success("Todo toggled successfully");
    },
    onError: (error, { id }, context) => {
      // Revert optimistic updates
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(["todo", id], context.previousTodo);
      }
      toast.error("Failed to toggle todo");
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
