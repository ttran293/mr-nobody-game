"use client";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MenuButton } from "@/components/ui/menu-button";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateRandomSettings, type StorySettings } from "@/components/game/GameSettings";
import { useGameSettings } from "@/components/game/GameSettingsContext";

export default function SettingsPage() {
  const [mode, setMode] = useState<"random" | "manual">("random");
  const [totalChapters, setTotalChapters] = useState<number>(6);                      
  const { setSettings } = useGameSettings();
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    setShowSuccess(false);

    try {
      let finalSettings: StorySettings;

      if (mode === "random") {
        finalSettings = generateRandomSettings();
      } else {
        finalSettings = generateRandomSettings();
        finalSettings.lifeArc.totalMainChapters = totalChapters;
      }

      if (!finalSettings || !finalSettings.lifeArc) {
        setError("Failed to generate valid settings");
        return;
      }

      setSettings(finalSettings);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      setError(`Error saving settings: ${errorMessage}`);
      console.error("Error in handleSave:", error);
    }
  };

  return (
    <div className="font-sans min-h-screen w-full bg-background">
      {/* Fixed buttons at top right */}
      <div className="fixed top-8 right-8 z-[100] pointer-events-auto">
        <ThemeToggle />
      </div>
      <div className="fixed top-8 right-24 z-[100] pointer-events-auto">
        <MenuButton />
      </div>
      
      {/* Main content with proper spacing */}
      <main className="flex flex-col gap-8 items-center max-w-4xl mx-auto px-6 sm:px-8 pt-24 pb-12 w-full">
        <div className="flex flex-col gap-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center font-lexend">
            Game Settings
          </h1>

          <div className="flex flex-col gap-4">
            <Label className="text-lg font-lexend">Settings Mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={(value) => {
                console.log("RadioGroup value changed to:", value);
                setMode(value as "random" | "manual");
              }}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="random" id="random" />
                <Label htmlFor="random" className="text-base font-lexend cursor-pointer">
                  Random Settings
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="text-base font-lexend cursor-pointer">
                  Manual Settings
                </Label>
              </div>
            </RadioGroup>
          </div>

          {mode === "manual" && (
            <div className="flex flex-col gap-4">
              <Label htmlFor="chapters" className="text-lg font-lexend">
                Number of Chapters
              </Label>
              <Input
                id="chapters"
                type="number"
                min="10"
                max="15"
                value={totalChapters}
                onChange={(event) => {
                  const value = parseInt(event.target.value, 10) || 10;
                  setTotalChapters(Math.max(10, Math.min(15, value)));
                }}
                className="font-lexend"
              />
              <p className="text-sm text-muted-foreground font-lexend">
                Choose between 10 and 15 chapters
              </p>
            </div>
          )}

          {error && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <AlertDescription className="text-red-800 dark:text-red-200 font-lexend">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {showSuccess && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200 font-lexend">
                Settings saved successfully!
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleSave} 
            className="w-full font-lexend" 
            size="lg"
            type="button"
          >
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  );
}
