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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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

  // Check if chapter is ending
  const isEndingChapter = isEnding || chapter.id.startsWith("ending_") || !hasChoices;

  if (isEndingChapter) {
    return (
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-zinc-700/30 py-4">
        <div className="flex justify-center">
          <Button
            variant="default"
            size="lg"
            className="transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            onClick={onRestart}
          >
            Restart Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog>
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-zinc-700/30 py-4">
        {!isLoading && (
          <div className="flex justify-center gap-3">
            {canRegret && redoCountNow > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                    >
                      Regret ({redoCountNow})
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  Undo your last choice ({redoCountNow} left)
                </TooltipContent>
              </Tooltip>
            )}

            {canRegret && redoCountNow === 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    Regret (0)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>You have no redos left</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="lg"
                  onClick={onContinue}
                  disabled={hasChoices && !hasSelected}
                  className={`transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
                    hasChoices && !hasSelected ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Continue
                </Button>
              </TooltipTrigger>
              <TooltipContent>Click to proceed to the next chapter</TooltipContent>
            </Tooltip>
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
