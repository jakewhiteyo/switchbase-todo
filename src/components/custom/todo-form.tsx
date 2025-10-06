"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "./date-picker";
import { Priority } from "@/generated/prisma";
import { type CreateTodoData } from "@/app/hooks/useTodos";

interface TodoFormProps {
  onSubmit: (data: CreateTodoData) => Promise<void>;
  isLoading?: boolean;
}

export function TodoForm({ onSubmit, isLoading }: TodoFormProps) {
  const [formData, setFormData] = useState<CreateTodoData>({
    title: "",
    description: "",
    priority: Priority.MEDIUM,
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: Priority.MEDIUM,
        dueDate: "",
      });
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Todo</CardTitle>
        <CardDescription>Add a new task to your todo list</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter todo title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <DatePicker
                id="dueDate"
                value={formData.dueDate as string}
                onChange={(value) =>
                  setFormData({ ...formData, dueDate: value })
                }
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !formData.title.trim()}>
            {isLoading ? "Creating..." : "Create Todo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
