import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { Chapter } from "./types";

interface GameActionsProps {
  chapter: Chapter;
  isEnding: boolean;
  hasSelected: boolean;
  redoCountNow: number;
  isLoading?: boolean;
  onContinue: () => void | Promise<void>;
  onRegret: () => void;
  onRestart: () => void;
}

export function GameActions({
  chapter,
  isEnding,
  hasSelected,
  redoCountNow,
  isLoading = false,
  onContinue,
  onRegret,
  onRestart,
}: GameActionsProps) {
  const canRegret = chapter.id !== "chapter_1" && chapter.id !== "chapter_2";
  const hasChoices = !!chapter.choices?.length;
  
  // Also check if chapter has no choices (ending indicator)
  const isEndingChapter = isEnding || chapter.id.startsWith("ending_") || !hasChoices;

  if (isEndingChapter) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <Button variant="outline" className="w-24" onClick={onRestart}>
          Restart
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <div className="fixed bottom-8 right-8 z-50">
        <div className="flex gap-2">
          {canRegret && (
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                I regret my decision
              </Button>
            </DialogTrigger>
          )}
          {redoCountNow === 0 && (
            <Button variant="outline" disabled>
              I regret my decision
            </Button>
          )}
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onContinue}
            disabled={(hasChoices && !hasSelected) || isLoading}
          >
            {isLoading ? "Generating..." : "Continue"}
          </Button>
        </div>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You have {redoCountNow} redos left.</DialogTitle>
          <DialogDescription>Are you sure?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onRegret}>
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
  );
}

