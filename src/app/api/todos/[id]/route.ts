import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

// GET /api/todos/[id] - Get a single todo by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: todoId } = await params;

    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    // Ensure the todo belongs to the authenticated user
    if (todo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/todos/[id] - Update a todo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: todoId } = await params;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (existingTodo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate priority if provided
    if (body.priority && !["LOW", "MEDIUM", "HIGH"].includes(body.priority)) {
      return NextResponse.json(
        { error: "Invalid priority value. Must be LOW, MEDIUM, or HIGH" },
        { status: 400 }
      );
    }

    // Validate dueDate if provided
    let dueDate = undefined;
    if (body.dueDate !== undefined) {
      if (body.dueDate === null) {
        dueDate = null;
      } else {
        dueDate = new Date(body.dueDate);
        if (isNaN(dueDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid due date format" },
            { status: 400 }
          );
        }
      }
    }

    // Build update data object - only include fields that are provided
    const updateData: Prisma.TodoUpdateInput = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.completed !== undefined) updateData.completed = body.completed;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: updateData,
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: todoId } = await params;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (existingTodo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.todo.delete({
      where: { id: todoId },
    });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
