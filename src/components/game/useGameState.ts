import { useEffect, useState, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Chapter, Decision } from "./types";
import type { CharacterSettings } from "./GameSettings";
import { useGameSettings } from "./GameSettingsContext";

export function useGameState(
  dataChapters: Record<string, Chapter>,
  startId: string,
  onChaptersUpdate?: Dispatch<SetStateAction<Record<string, Chapter>>>,
  character?: CharacterSettings | null,
  initialCharacter?: CharacterSettings | null
) {
  const getChapter = (id: string): Chapter | undefined => dataChapters[id];
  const { settings, setCharacter } = useGameSettings();
  const settingsRef = useRef(settings);
  const characterRef = useRef(character);
  const initialCharacterRef = useRef(initialCharacter);
  
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  
  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  useEffect(() => {
    initialCharacterRef.current = initialCharacter;
  }, [initialCharacter]);
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
          character: characterRef.current || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          error: "Failed to generate chapter",
        }));
        throw new Error(errorData.error || "Failed to generate chapter");
      }

      const responseData = await res.json();
      
      // Handle both old format (just chapter) and new format (chapter + character)
      const newChapter: Chapter = responseData.chapter || responseData;
      const updatedCharacter: CharacterSettings | undefined = responseData.character;
      
      // Update character in context if we got an updated one
      if (updatedCharacter) {
        setCharacter(updatedCharacter);
      }
      
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

    const untakenChoices = chapter.choices
      .filter((c) => c.id !== selected)
      .map((c) => ({
        id: c.id,
        text: c.text,
        next: c.next,
      }));

    console.log(untakenChoices);

    const decision: Decision = {
      chapterId,
      choiceId: selected ?? "",
      choiceText: chosen.text,
      chapterAge: chapter.age,
      untakenChoices: untakenChoices,
      // capture a snapshot of the character before this decision so regret can restore it.
      characterBefore: characterRef.current
        ? JSON.parse(JSON.stringify(characterRef.current))
        : undefined,
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
      
      // Generate life summary and alternative timelines for ending chapter
      if (!nextChapter.lifeSummary) {
        try {
          console.log("Generating life summary and alternative timelines...");
          
          const allDecisions = [...decisions, decision]; // Include current decision
          
          // Fetch both summary and alternatives in parallel
          const [summaryRes, alternativesRes] = await Promise.all([
            fetch("/api/chapters/summary", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                character: characterRef.current,
                initialCharacter: initialCharacterRef.current,
                decisions: allDecisions,
                chapters: dataChapters,
                finalAge: nextChapter.age,
                isDeath: actualNextId.includes("death"),
              }),
            }),
            fetch("/api/chapters/alternatives", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                character: characterRef.current,
                decisions: allDecisions,
                finalAge: nextChapter.age,
              }),
            }),
          ]);

          if (summaryRes.ok) {
            const { summary } = await summaryRes.json();
            nextChapter.lifeSummary = summary;
          }

          if (alternativesRes.ok) {
            const { alternatives } = await alternativesRes.json();
            nextChapter.alternativeTimelines = alternatives;
            console.log(`Generated ${alternatives.length} alternative timelines`);
          }
          
          // Update chapter with summary and alternatives
          if (onChaptersUpdate) {
            onChaptersUpdate((prevChapters) => ({
              ...prevChapters,
              [actualNextId]: nextChapter!,
            }));
          }
        } catch (err) {
          console.error("Failed to generate ending content:", err);
          // Continue without summary/alternatives
        }
      }
    }

    setSelected(nextChapter?.choices?.[0]?.id ?? null);
  };

  const onRestart = () => {
    if (initialCharacterRef.current) {
      setCharacter(initialCharacterRef.current);
    }
    
    setIsEnding(false);
    setDecisions([]);
    setRedoCountNow(3);
    setError(null);
    
    setChapterId(startId);
    const startChapter = getChapter(startId);
    setSelected(startChapter?.choices?.[0]?.id ?? null);
    
    // Clear all generated chapters except the start chapter
    if (onChaptersUpdate && startChapter) {
      onChaptersUpdate({ [startId]: startChapter });
    }
  };

  const onRegret = () => {
    if (decisions.length === 0 || redoCountNow === 0) return;

    const lastDecision = decisions[decisions.length - 1];

    setDecisions((prev) => prev.slice(0, -1));

    setChapterId(lastDecision.chapterId);
    setSelected(lastDecision.choiceId);
    setIsEnding(false);
    setRedoCountNow((prev) => prev - 1);

    if (lastDecision.characterBefore) {
      setCharacter(lastDecision.characterBefore);
    }
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

