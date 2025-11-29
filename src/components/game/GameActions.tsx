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
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm py-4 mt-8">
        <div className="flex justify-center">
          <Button variant="default" size="lg" onClick={onRestart}>
            Restart Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog>
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm py-4 mt-8">
        {!isLoading && (
          <div className="flex justify-center gap-3">
            {canRegret && redoCountNow > 0 && (
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  Regret ({redoCountNow})
                </Button>
              </DialogTrigger>
            )}
            {canRegret && redoCountNow === 0 && (
              <Button variant="outline" size="lg" disabled>
                Regret (0)
              </Button>
            )}
            <Button
              variant="default"
              size="lg"
              onClick={onContinue}
              disabled={hasChoices && !hasSelected}
            >
              Continue
            </Button>
          </div>
        )}
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

