import type { Chapter } from "./types";

interface AgeDisplayProps {
  chapter: Chapter;
}

export function AgeDisplay({ chapter }: AgeDisplayProps) {
  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 top-8 z-50 flex justify-center w-full">
      <p className="text-2xl font-lexend">
        You are{" "}
        <span style={{ color: "#ffdd00" }}>{chapter.age}</span> years old
      </p>
    </div>
  );
}

