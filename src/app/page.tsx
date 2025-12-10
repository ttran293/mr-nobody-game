import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";



export default async function Home() {

  return (
    <div className="font-sans min-h-screen w-full bg-background flex items-center justify-center">
      {/* Fixed button at top right */}
      <div className="fixed top-8 right-8 z-[100] pointer-events-auto">
        <ThemeToggle />
      </div>
      
      {/* Centered main content */}
      <main className="flex flex-col gap-8 items-stretch w-full max-w-md px-6">
        <h1 className="text-3xl font-bold text-center">Mr. Nobody</h1>
        <div className="flex flex-col gap-4 w-full">
          <Button
            asChild
            size="lg"
            className="text-xl font-bold text-center w-full"
          >
            <Link href="/game">New Game</Link>
          </Button>
          {/* <Button
            asChild
            size="lg"
            variant="outline"
            className="text-xl font-bold text-center w-full  "
          >
            <Link href="/demo">Play Demo</Link>
          </Button> */}
          {/* <Button
            asChild
            size="lg"
            variant="outline"
            className="text-xl font-bold text-center w-full"
          >
            <Link href="/settings">Settings</Link>
          </Button> */}
        </div>
      </main>
    </div>
  );
}
