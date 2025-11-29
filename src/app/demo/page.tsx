import { ThemeToggle } from "@/components/theme-toggle";
import GameChapter from "@/components/game-chapter";
import { demo } from "@/data/demo";
// import { CharacterProps } from "@/lib/character";

export default async function Demo() {
//   const host = (await headers()).get("host")!;
//   const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
//   const res = await fetch(`${protocol}://${host}/api/characters`, {
//     cache: "no-store",
//   });
//   const characters = (await res.json()) as CharacterProps[];

  return (
    <div className="font-sans min-h-screen w-full bg-background">
      <div className="fixed top-8 right-8 z-[100] pointer-events-auto">
        <ThemeToggle />
      </div>
      
      <main className="w-full mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-12">
        <GameChapter startId="chapter_1" dataChapters={demo} />
      </main>
    </div>
  );
}
