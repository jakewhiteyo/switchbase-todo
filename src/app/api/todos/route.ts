import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Priority, Prisma } from "@/generated/prisma";

// GET /api/todos - Get all todos for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const completed = searchParams.get("completed");
    const priority = searchParams.get("priority");

    // Build where clause
    const where: Prisma.TodoScalarWhereInput = { userId };

    if (completed !== null) {
      where.completed = completed === "true";
    }

    if (
      priority &&
      [Priority.LOW, Priority.MEDIUM, Priority.HIGH].includes(
        priority as Priority
      )
    ) {
      where.priority = priority as Priority;
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (
      body.priority &&
      ![Priority.LOW, Priority.MEDIUM, Priority.HIGH].includes(
        body.priority as Priority
      )
    ) {
      return NextResponse.json(
        { error: "Invalid priority value. Must be LOW, MEDIUM, or HIGH" },
        { status: 400 }
      );
    }

    // Validate dueDate if provided
    let dueDate = undefined;
    if (body.dueDate) {
      dueDate = new Date(body.dueDate);
      if (isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid due date format" },
          { status: 400 }
        );
      }
    }

    const todo = await prisma.todo.create({
      data: {
        title: body.title,
        description: body.description || null,
        completed: body.completed || false,
        priority: body.priority || Priority.MEDIUM,
        dueDate: dueDate || null,
        userId,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
