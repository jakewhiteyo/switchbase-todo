import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/custom/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="font-sans flex flex-col items-center min-h-[calc(100vh-80px)] px-8 pb-20 sm:px-20 line-grid">
        <main className="flex flex-col gap-[32px] items-center sm:items-start mt-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">
              Reimagine Your ToDo List
            </h1>
            <p className="text-6xl font-bold mb-8">
              <span className="text-sw-green">Fast.</span>{" "}
              <span className="text-sw-new-green">Flexible.</span>
              <br />
              <span className="text-sw-orange">Simple.</span>
            </p>
            <p className="text-lg mb-8 text-muted-foreground">
              This todo list app is an all-in-one platform for managing your
              life.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button size="lg" className="font-bold">
                Get Started
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
