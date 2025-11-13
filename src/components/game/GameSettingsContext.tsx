"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import type { StorySettings } from "./GameSettings";

interface GameSettingsContextType {
  settings: StorySettings | null;
  setSettings: (settings: StorySettings | null) => void;
}

const GameSettingsContext = createContext<GameSettingsContextType | undefined>(
  undefined
);

export function GameSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StorySettings | null>(null);

  return (
    <GameSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings() {
  const context = useContext(GameSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useGameSettings must be used within a GameSettingsProvider"
    );
  }
  return context;
}

