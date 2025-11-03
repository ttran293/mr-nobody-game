import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";



export default async function Home() {

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="fixed top-8 right-8 z-50">
        <ThemeToggle />
      </div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center max-w-4xl mx-auto px-4">
        {/* <p className="text-2xl font-bold text-center">Welcome to the game</p> */}
        <div className="flex flex-col gap-4">
          <Button className="text-2xl font-bold text-center font-open-sans">
            New Game
          </Button>
          <Button asChild className="text-2xl font-bold text-center font-open-sans">
            <Link href="/demo">
              Play Demo
            </Link>
          </Button>

        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
