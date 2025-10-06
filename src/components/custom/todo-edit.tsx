"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "./date-picker";
import { Priority } from "@/generated/prisma";
import { type UpdateTodoData } from "@/app/hooks/useTodos";

interface TodoEditProps {
  todoId: string;
  formData: UpdateTodoData;
  onFormChange: (data: UpdateTodoData) => void;
  onSave: (id: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TodoEdit({
  todoId,
  formData,
  onFormChange,
  onSave,
  onCancel,
  isLoading,
}: TodoEditProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`edit-title-${todoId}`}>Title</Label>
          <Input
            id={`edit-title-${todoId}`}
            value={formData.title || ""}
            onChange={(e) =>
              onFormChange({
                ...formData,
                title: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`edit-priority-${todoId}`}>Priority</Label>
          <select
            id={`edit-priority-${todoId}`}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={formData.priority || Priority.MEDIUM}
            onChange={(e) =>
              onFormChange({
                ...formData,
                priority: e.target.value as Priority,
              })
            }
          >
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`edit-description-${todoId}`}>Description</Label>
          <Input
            id={`edit-description-${todoId}`}
            value={formData.description || ""}
            onChange={(e) =>
              onFormChange({
                ...formData,
                description: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`edit-dueDate-${todoId}`}>Due Date</Label>
          <DatePicker
            id={`edit-dueDate-${todoId}`}
            value={formData.dueDate as string}
            onChange={(value) =>
              onFormChange({
                ...formData,
                dueDate: value,
              })
            }
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(todoId)} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
