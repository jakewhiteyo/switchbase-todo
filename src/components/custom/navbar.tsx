import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">todo list</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            size="sm"
            className="bg-white text-black hover:bg-gray-100 shadow-none text-md"
          >
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
}
