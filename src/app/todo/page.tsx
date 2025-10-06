"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useToggleTodo,
  type CreateTodoData,
  type UpdateTodoData,
  type Todo,
} from "../hooks/useTodos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TodoDialog } from "@/components/custom/todo-dialog";
import { TodoItem } from "@/components/custom/todo-item";
import { TodoEdit } from "@/components/custom/todo-edit";

export default function TodoPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch todos
  const { todos, isLoading: todosLoading } = useTodos();

  // Mutations
  const { createTodo, isLoading: isCreating } = useCreateTodo();
  const { updateTodo, isLoading: isUpdating } = useUpdateTodo();
  const { deleteTodo, isLoading: isDeleting } = useDeleteTodo();
  const { toggleTodoSync } = useToggleTodo();

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateTodoData>({});

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const handleCreateTodo = async (data: CreateTodoData) => {
    await createTodo(data);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingId(todo.id);
    setEditForm({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.dueDate
        ? new Date(todo.dueDate).toISOString().split("T")[0]
        : "",
    });
  };

  const handleUpdateTodo = async (id: string) => {
    try {
      await updateTodo({ id, data: editForm });
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      await deleteTodo(id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
    toggleTodoSync({ id, completed: !completed });
  };

  if (!user) {
    return null;
  }

  const unfinishedTodos = todos?.filter((todo) => !todo.completed);

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 space-y-8">
      {/* Todos List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">My ToDo List</CardTitle>
              <CardDescription>
                {todosLoading
                  ? "Loading todos..."
                  : `${unfinishedTodos?.length || 0} unfinished todo${
                      unfinishedTodos?.length === 1 ? "" : "s"
                    } in your list`}
              </CardDescription>
            </div>
            <TodoDialog onSubmit={handleCreateTodo} isLoading={isCreating} />
          </div>
        </CardHeader>
        <CardContent>
          {todosLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : todos && todos.length > 0 ? (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingId === todo.id ? (
                    <TodoEdit
                      todoId={todo.id}
                      formData={editForm}
                      onFormChange={setEditForm}
                      onSave={handleUpdateTodo}
                      onCancel={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                      isLoading={isUpdating}
                    />
                  ) : (
                    <TodoItem
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onEdit={handleEditTodo}
                      onDelete={handleDeleteTodo}
                      isDeleting={isDeleting}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No todos yet. Create your first todo above!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
