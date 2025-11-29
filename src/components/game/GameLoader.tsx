"use client";
import { useState, useEffect, useRef } from "react";
import GameChapter from "@/components/game-chapter";
import type { Chapter } from "./types";
import { generateRandomSettings, generateRandomCharacter } from "./GameSettings";
import { useGameSettings } from "./GameSettingsContext";
import TypewriterText from "@/components/TypewriterText";

export function GameLoader() {
  const [chapters, setChapters] = useState<Record<string, Chapter>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [initialCharacter, setInitialCharacter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { settings, character, setSettings, setCharacter } = useGameSettings();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // skip if already initialized (prevents re-running on re-renders)
    if (hasInitializedRef.current) return;

    // always generate fresh character and settings for a new game
    const gameSettings = generateRandomSettings();
    const gameCharacter = generateRandomCharacter();

    setSettings(gameSettings);
    setCharacter(gameCharacter);

    // store the initial character for restart functionality
    setInitialCharacter(JSON.parse(JSON.stringify(gameCharacter)));

    hasInitializedRef.current = true;

    const fetchStartChapter = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/chapters/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            settings: gameSettings,
            character: gameCharacter 
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            error: "Failed to fetch chapter",
          }));
          throw new Error(errorData.error || "Failed to fetch chapter");
        }

        const chapter: Chapter = await res.json();
        setChapters({ [chapter.id]: chapter });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load game";
        setError(message);
        console.error("Error fetching start chapter:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartChapter();

    // reset on unmount so next visit generates fresh data
    return () => {
      hasInitializedRef.current = false;
    };
  }, [setSettings, setCharacter]);

  const initialTime = 5; 
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]); 

  if (timeLeft > 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-2xl px-4">
          <TypewriterText
            text={`There is no grand design. No script. Only the choices you make.`}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-2xl px-4">
          <p className="text-xl font-lexend text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <GameChapter
      startId="chapter_1"
      dataChapters={chapters}
      settings={settings}
      character={character}
      initialCharacter={initialCharacter}
    />
  );
}

