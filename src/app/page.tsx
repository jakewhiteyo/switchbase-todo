import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Server-side redirect if user is authenticated
  if (session) {
    redirect("/todo");
  }

  return (
    <main className="flex flex-col gap-[32px] items-center sm:items-start mt-40">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Reimagine Your ToDo List</h1>
        <p className="text-6xl font-bold mb-8">
          <span className="text-sw-green">Fast.</span>{" "}
          <span className="text-sw-new-green">Flexible.</span>
          <br />
          <span className="text-sw-orange">Simple.</span>
        </p>
        <p className="text-lg mb-4 text-muted-foreground">
          This todo list app is an all-in-one platform for managing your life.
        </p>
        <p className="text-lg mb-8 text-sw-orange">
          Built by{" "}
          <a
            href="https://jakewhiteyo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-sw-orange/80 transition-colors"
          >
            Jake White
          </a>{" "}
          for{" "}
          <a
            href="https://switchbase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-sw-orange/80 transition-colors"
          >
            SwitchBase
          </a>
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button size="lg" className="font-bold" asChild>
            <a href="/auth/sign-up">Get Started</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
