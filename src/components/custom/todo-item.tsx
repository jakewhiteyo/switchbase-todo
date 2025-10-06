"use client";

import { Button } from "@/components/ui/button";
import { Priority } from "@/generated/prisma";
import { type Todo } from "@/app/hooks/useTodos";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  isDeleting,
}: TodoItemProps) {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return "text-red-600 font-semibold";
      case Priority.MEDIUM:
        return "text-yellow-600 font-semibold";
      case Priority.LOW:
        return "text-green-600 font-semibold";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-4">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id, todo.completed)}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
      />

      <div className="flex-1 space-y-1">
        <h3
          className={`text-lg font-semibold ${
            todo.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {todo.title}
        </h3>

        {todo.description && (
          <p
            className={`text-sm ${
              todo.completed ? "text-muted-foreground" : ""
            }`}
          >
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <span className={getPriorityColor(todo.priority)}>
            Priority: {todo.priority}
          </span>
          <span className="text-muted-foreground">
            Due: {formatDate(todo.dueDate)}
          </span>
          <span className="text-muted-foreground">
            Created: {formatDate(todo.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(todo)}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(todo.id)}
          disabled={isDeleting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
