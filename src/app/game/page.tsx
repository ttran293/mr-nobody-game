import { ThemeToggle } from "@/components/theme-toggle";
import { GameLoader } from "@/components/game/GameLoader";

export default function Game() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="fixed top-8 right-8 z-[100] pointer-events-auto">
        <ThemeToggle />
      </div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center max-w-4xl mx-auto px-4">
        <div className="grid grid-flow-col grid-rows-3 gap-16">
          <div className="row-span-3">
            <div className="flex flex-col gap-4">
              <GameLoader />
            </div>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
