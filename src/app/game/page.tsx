import { ThemeToggle } from "@/components/theme-toggle";
import { GameLoader } from "@/components/game/GameLoader";

export default function Game() {
  return (
    <div className="font-sans min-h-screen w-full bg-background">
      <div className="fixed top-8 right-8 z-[100] pointer-events-auto">
        <ThemeToggle />
      </div>
      
      <main className="w-full mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-12">
        <GameLoader />
      </main>
    </div>
  );
}
