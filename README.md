# ToDo App for SwitchBase

![SwitchBase Todo App](/public/title.png)

A todo list application built with Next.js, featuring user authentication, priority levels, due dates, and a clean, responsive UI (loosely based off the SwitchBase marketing page).

## Features

- User authentication with NextAuth.js
- Create, edit, and delete todos
- Set priorities (`Low`, `Medium`, `High`)
- Add due dates
- Toggle todos between complete/incomplete
- PostgreSQL database with Prisma ORM

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
cp .env.example .env.local
# Add your DATABASE_URL, DIRECT_URL, NEXTAUTH_URL and NEXTAUTH_SECRET
```

3. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn-ui
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query
