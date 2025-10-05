import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            Welcome to Switchbase Todo
          </h1>
          <div className="flex gap-4 flex-wrap justify-center">
            <Button>Primary Button</Button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div>Built with shadcn/ui + Tailwind CSS</div>
      </footer>
    </div>
  );
}
