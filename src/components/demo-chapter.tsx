// src/components/DemoClient.tsx
"use client";
import { useState } from "react";
import { demo } from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eraser } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { MenuButton } from "@/components/ui/menu-button";

type Chapter = (typeof demo)[keyof typeof demo];

interface Choice {
  id: string;
  text: string;
  next: string;
}

interface Decision {
  chapterId: string;
  choiceId: string;
  choiceText: string;
  chapterAge: number;
}

function getChapter(id: string): Chapter {
  return (demo as Record<string, Chapter>)[id];
}

export default function DemoClient({
  startId = "chapter_1",
}: {
  startId?: string;
}) {
  const [chapterId, setChapterId] = useState(startId);
  const chapter = getChapter(chapterId);
  const [selected, setSelected] = useState<string | null>(
    chapter.choices?.[0]?.id ?? null
  );
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [redoCountNow, setRedoCountNow] = useState<number>(3); 
  const redoCountLen = 3 
 

  const onContinue = () => {
    // If choices exist, use selected choice's next; otherwise bail
    if (chapter.choices?.length && selected) {
      const chosen = chapter.choices.find((c) => c.id === selected);
      const nextId = chosen?.next;
      
      if (nextId && chosen) {
        // Store the decision before navigating
        const decision: Decision = {
          chapterId: chapterId,
          choiceId: selected,
          choiceText: chosen.text,
          chapterAge: chapter.age,
        };
        setDecisions([...decisions, decision]);
        console.log("Decisions so far:", [...decisions, decision]);
        
        setChapterId(nextId);
        if (nextId.startsWith("ending_")) {
          setIsEnding(true);
        }
        setSelected(getChapter(nextId)?.choices?.[0]?.id ?? null);
      }
      return;
    }
    // No choices = terminal
  };

  const onRestart = () => {
    console.log('restart');
    setIsEnding(false);
    setDecisions([]); // Clear all decisions on restart
    setChapterId(startId);
    setSelected(getChapter(startId)?.choices?.[0]?.id ?? null);
    setRedoCountNow(3);
  };

  const onRegret = () => {
    console.log('regret');
    // Remove the last decision and go back to that chapter
    if (decisions.length > 0 && redoCountNow > 0) {
      const lastDecision = decisions[decisions.length - 1];
      const newDecisions = decisions.slice(0, -1);
      setDecisions(newDecisions);
      setChapterId(lastDecision.chapterId);
      setSelected(lastDecision.choiceId);
      setIsEnding(false);
      setRedoCountNow(redoCountNow - 1);
      console.log('Regret: Back to', lastDecision.chapterId);
    }
  };
  
  return (
    <div className="flex flex-col gap-6">
      <MenuButton />
      <div className="fixed top-8 left-8 z-50">
        <div className="flex items-center gap-2">
          {redoCountLen > 0 &&
            [...Array(redoCountLen)].map((_, i) => (
              <Eraser
                key={i}
                size={32}
                color={i < redoCountNow ? "#ffdd00" : "#cccccc"}
              />
            ))}
        </div>
      </div>

      <div className="fixed left-1/2 transform -translate-x-1/2 top-8 z-50 flex justify-center w-full">
        <p className="text-2xl font-open-sans">
          You are{" "}
          <span className="" style={{ color: "#ffdd00" }}>
            {chapter.age}
          </span>{" "}
          years old
        </p>
      </div>

      <p className="text-2xl font-open-sans">{chapter.text}</p>

      {chapter.choices?.length ? (
        <RadioGroup value={selected ?? ""} onValueChange={setSelected}>
          {chapter.choices.map((choice: Choice) => (
            <div key={choice.id} className="flex items-center gap-3">
              <RadioGroupItem value={choice.id} id={choice.id} className="cursor-pointer"/>
              <Label htmlFor={choice.id} className="text-2xl font-open-sans">
                {choice.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : null}
      <Dialog>
        {isEnding ? null : (
          <div className="fixed bottom-8 right-8 z-50">
            <div className="flex gap-2">
              {chapter.id !== "chapter_1" && chapter.id !== "chapter_2" && (
                <DialogTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    I regret my decision
                  </Button>
                </DialogTrigger>
              )}
              {redoCountNow === 0 && (
                <Button variant="outline" className="" disabled>
                  I regret my decision
                </Button>
              )}
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={onContinue}
                disabled={!!chapter.choices?.length && !selected}
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You have {redoCountNow} redos left.</DialogTitle>
            <DialogDescription>Are you sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="" onClick={onRegret}>
                Yes, I&apos;m sure.
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                No, I&apos;ll continue.
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEnding ? (
        <div className="fixed bottom-8 right-8 z-50">
          <Button variant="outline" className="w-24" onClick={onRestart}>
            Restart
          </Button>
        </div>
      ) : null}
    </div>
  );
}
