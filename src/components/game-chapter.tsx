"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { MenuButton } from "@/components/ui/menu-button";
import { useGameState } from "./game/useGameState";
import { RedoCounter } from "./game/RedoCounter";
import { ChapterChoices } from "./game/ChapterChoices";
import { GameActions } from "./game/GameActions";
import { CharacterInfo } from "./game/CharacterInfo";
import type { Chapter } from "./game/types";
import type { StorySettings, CharacterSettings } from "./game/GameSettings";

interface GameChapterProps {
  startId?: string;
  dataChapters: Record<string, Chapter>;
  settings?: StorySettings | null;
  character?: CharacterSettings | null;
  initialCharacter?: CharacterSettings | null;
}

export default function GameChapter({
  startId = "chapter_1",
  dataChapters,
  character,
  initialCharacter,
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
  } = useGameState(chapters, startId, setChapters, character, initialCharacter);

  if (!chapter) {
    return (
      <div className="w-full">
        <div className="fixed top-8 right-24 z-[100] pointer-events-auto">
          <MenuButton />
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-2xl font-lexend"></p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="fixed top-8 right-24 z-[100] pointer-events-auto">
        <MenuButton />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 w-full max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-6 min-w-0 xl:col-span-7 justify-center items-center">
          <RedoCounter redoCountNow={redoCountNow} redoCountLen={redoCountLen} />
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4">
              <Image
                src="/loading.gif"
                alt="generating next chapter"
                width={120}
                height={120}
                className="rounded-lg"
              />
              <p className="text-sm font-lexend text-muted-foreground">
                generating next chapter...
              </p>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg font-lexend text-destructive">Error: {error}</p>
            </div>
          )}
          
          {!isLoading && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-muted-foreground">
                  {chapter.id.startsWith('ending_') 
                    ? 'Ending' 
                    : `Chapter ${chapter.id.replace('chapter_', '')}`}
                </h2>
                
                {chapter.chapterNumber && chapter.totalChapters && !chapter.id.startsWith('ending_') && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <div className="w-48 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(chapter.chapterNumber / chapter.totalChapters) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground/70 tabular-nums">
                      {chapter.chapterNumber} / {chapter.totalChapters}
                    </p>
                  </div>
                )}
                
                {chapter.motifs && chapter.motifs.length > 0 && (
                  <p className="text-xs text-muted-foreground/60 mt-2 italic font-light">
                    {chapter.motifs.join(' • ')}
                  </p>
                )}
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-lg font-lexend leading-relaxed">{chapter.text}</p>
              </div>
              
              {chapter.id.startsWith('ending_') && (
                <div className="mt-8 border-t-2 pt-6 w-full">
                  <h3 className="text-lg font-bold text-center mb-4 text-muted-foreground">
                    Life in Review
                  </h3>
                  {chapter.lifeSummary ? (
                    <div className="prose prose-base max-w-none text-muted-foreground">
                      {chapter.lifeSummary.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
                      <Image
                        src="/loading.gif"
                        alt="generating life summary"
                        width={90}
                        height={90}
                        className="rounded-lg"
                      />
                      <p className="text-xs font-lexend uppercase tracking-wide">compiling life summary...</p>
                    </div>
                  )}
                </div>
              )}

              {chapter.id.startsWith('ending_') && (
                <div className="mt-8 border-t-2 pt-6 w-full">
                  <h3 className="text-lg font-bold text-center mb-6 text-muted-foreground">
                    Roads Not Taken
                  </h3>
                  {chapter.alternativeTimelines && chapter.alternativeTimelines.length > 0 ? (
                    <div className="space-y-6">
                      {chapter.alternativeTimelines.map((timeline, index) => (
                        <div 
                          key={index} 
                          className="p-5 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20"
                        >
                          <div className="mb-3 pb-2 border-b border-muted-foreground/20">
                            <p className="text-sm font-semibold text-muted-foreground/80">
                              Pivot Point: Age {timeline.pivotAge}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              <span className="font-medium">You chose:</span> &quot;{timeline.actualChoice}&quot;
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              <span className="font-medium">What if you chose:</span> &quot;{timeline.alternativeChoice}&quot;
                            </p>
                          </div>
                          <div className="prose prose-sm max-w-none text-muted-foreground/90">
                            {timeline.narrative.split('\n\n').map((paragraph, pIndex) => (
                              <p key={pIndex} className="mb-3 leading-relaxed italic">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
                      <Image
                        src="/loading.gif"
                        alt="generating alternative timelines"
                        width={90}
                        height={90}
                        className="rounded-lg"
                      />
                      <p className="text-xs font-lexend uppercase tracking-wide">exploring alternate paths...</p>
                    </div>
                  )}
                </div>
              )}
              
              {chapter.choices && (
                <div className="mt-2">
                  <ChapterChoices
                    choices={chapter.choices}
                    selected={selected}
                    onSelect={setSelected}
                  />
                </div>
              )}
            </div>
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

          <div className="w-full xl:col-span-5 xl:sticky xl:top-8 xl:self-start xl:h-fit xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto">
          <div className="rounded-xl border-2 bg-card p-8 shadow-lg transition-all hover:shadow-xl">
            <CharacterInfo age={chapter.age} />
          </div>
        </div>
      </div>
    </div>
  );
}
