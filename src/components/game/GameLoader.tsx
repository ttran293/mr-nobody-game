"use client";
import { useState, useEffect, useRef } from "react";
import GameChapter from "@/components/game-chapter";
import type { Chapter } from "./types";
import { generateRandomSettings } from "./GameSettings";
import { useGameSettings } from "./GameSettingsContext";

export function GameLoader() {
  const [chapters, setChapters] = useState<Record<string, Chapter>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings, setSettings } = useGameSettings();
  const hasFetchedRef = useRef(false);
  console.log("settings", settings);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    
    const gameSettings = settings || generateRandomSettings();
    
    if (!settings) {
      setSettings(gameSettings);
    }

    hasFetchedRef.current = true;

    const fetchStartChapter = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/chapters/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ settings: gameSettings }),
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
  }, [settings, setSettings]);


  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center py-4">
          <p className="text-lg font-lexend">Loading your story...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center py-4">
          <p className="text-lg font-lexend">Error: {error}</p>
        </div>
        <p className="text-xl font-lexend text-red-500">Error: {error}</p>
      </div>
    );
  }

  return <GameChapter startId="chapter_1" dataChapters={chapters} settings={settings} />;
}

