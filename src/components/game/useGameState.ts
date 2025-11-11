import { useEffect, useState, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Chapter, Decision } from "./types";
import type { StorySettings } from "./GameSettings";

export function useGameState(
  dataChapters: Record<string, Chapter>,
  startId: string,
  onChaptersUpdate?: Dispatch<SetStateAction<Record<string, Chapter>>>,
  settings?: StorySettings | null
) {
  const getChapter = (id: string): Chapter | undefined => dataChapters[id];
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  const [chapterId, setChapterId] = useState(startId);
  const [selected, setSelected] = useState<string | null>(() => {
    const chapter = getChapter(startId);
    return chapter?.choices?.[0]?.id ?? null;
  });
  const [isEnding, setIsEnding] = useState(false);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [redoCountNow, setRedoCountNow] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapter = getChapter(chapterId);
  const redoCountLen = 3;

  const generateNextChapter = async (
    previousChapter: Chapter,
    decision: Decision,
    nextChapterId: string
  ): Promise<Chapter | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/chapters/next", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          previousChapter,
          decision,
          nextChapterId,
          settings: settingsRef.current || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          error: "Failed to generate chapter",
        }));
        throw new Error(errorData.error || "Failed to generate chapter");
      }

      const newChapter: Chapter = await res.json();
      return newChapter;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate chapter";
      setError(message);
      console.error("Error generating chapter:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const onContinue = async () => {
    if (!chapter || isLoading) return;
    if (chapter.choices && chapter.choices.length > 0 && !selected) return;


    if (!chapter.choices || chapter.choices.length === 0) {
      return;
    }

    const chosen = chapter.choices.find((c) => c.id === selected);
    const nextId = chosen?.next;

    if (!nextId || !chosen) return;

    const decision: Decision = {
      chapterId,
      choiceId: selected ?? "",
      choiceText: chosen.text,
      chapterAge: chapter.age,
    };

    // Check if next chapter already exists
    let nextChapter = getChapter(nextId);

    // If chapter doesn't exist, generate it
    if (!nextChapter) {
      nextChapter = await generateNextChapter(chapter, decision, nextId) as Chapter;

      if (!nextChapter) {
        // Error state is already set by generateNextChapter
        return;
      }

      // Update chapters with the new chapter using its actual ID (might be ending_X)
      if (onChaptersUpdate) {
        onChaptersUpdate((prevChapters) => ({
          ...prevChapters,
          [nextChapter!.id]: nextChapter!,
        }));
      }
    }

    setDecisions((prev) => [...prev, decision]);

    const actualNextId = nextChapter.id;
    setChapterId(actualNextId);

   
    if (actualNextId.startsWith("ending_") || !nextChapter.choices || nextChapter.choices.length === 0) {
      setIsEnding(true);
    }

    setSelected(nextChapter?.choices?.[0]?.id ?? null);
  };

  const onRestart = () => {
    setIsEnding(false);
    setDecisions([]);
    setChapterId(startId);
    const startChapter = getChapter(startId);
    setSelected(startChapter?.choices?.[0]?.id ?? null);
    setRedoCountNow(3);
  };

  const onRegret = () => {
    if (decisions.length === 0 || redoCountNow === 0) return;

    const lastDecision = decisions[decisions.length - 1];
    setDecisions((prev) => prev.slice(0, -1));
    setChapterId(lastDecision.chapterId);
    setSelected(lastDecision.choiceId);
    setIsEnding(false);
    setRedoCountNow((prev) => prev - 1);
  };

  return {
    chapter,
    selected,
    setSelected,
    isEnding,
    decisions,
    redoCountNow,
    redoCountLen,
    isLoading,
    error,
    onContinue,
    onRestart,
    onRegret,
  };
}

