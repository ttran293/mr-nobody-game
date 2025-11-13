"use client";
import { useState, useEffect } from "react";
import { MenuButton } from "@/components/ui/menu-button";
import { useGameState } from "./game/useGameState";
import { RedoCounter } from "./game/RedoCounter";
import { AgeDisplay } from "./game/AgeDisplay";
import { ChapterChoices } from "./game/ChapterChoices";
import { GameActions } from "./game/GameActions";
import type { Chapter } from "./game/types";
import type { StorySettings } from "./game/GameSettings";

interface GameChapterProps {
  startId?: string;
  dataChapters: Record<string, Chapter>;
  settings?: StorySettings | null;
}

export default function GameChapter({
  startId = "chapter_1",
  dataChapters,
  settings,
}: GameChapterProps) {
  const [chapters, setChapters] = useState<Record<string, Chapter>>(dataChapters);

  useEffect(() => {
    setChapters(dataChapters);
    console.log("dataChapters", dataChapters);
  }, [dataChapters]);

  const {
    chapter,
    selected,
    setSelected,
    isEnding,
    redoCountNow,
    redoCountLen,
    isLoading,
    error,
    onContinue,
    onRestart,
    onRegret,
  } = useGameState(chapters, startId, setChapters);

  if (!chapter) {
    return (
      <div className="flex flex-col gap-6">
        <MenuButton />
        <p className="text-2xl font-lexend">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <MenuButton />
      <RedoCounter redoCountNow={redoCountNow} redoCountLen={redoCountLen} />
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-lg font-lexend">Generating next chapter...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500">
          <p className="text-lg font-lexend">Error: {error}</p>
        </div>
      )}
      {!isLoading && (
        <>
          <AgeDisplay chapter={chapter} />
          <p className="text-2xl font-lexend">{chapter.text}</p>
          {chapter.choices && (
            <ChapterChoices
              choices={chapter.choices}
              selected={selected}
              onSelect={setSelected}
            />
          )}
        </>
      )}
      <GameActions
        chapter={chapter}
        isEnding={isEnding}
        hasSelected={!!selected}
        redoCountNow={redoCountNow}
        onContinue={onContinue}
        onRegret={onRegret}
        onRestart={onRestart}
        isLoading={isLoading}
      />
    </div>
  );
}
