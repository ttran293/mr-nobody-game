import { Eraser } from "lucide-react";

interface RedoCounterProps {
  redoCountNow: number;
  redoCountLen: number;
}

export function RedoCounter({ redoCountNow, redoCountLen }: RedoCounterProps) {
  if (redoCountLen === 0) return null;

  return (
    <div className="fixed top-8 left-8 z-50">
      <div className="flex items-center gap-2">
        {[...Array(redoCountLen)].map((_, i) => (
          <Eraser
            key={i}
            size={32}
            color={i < redoCountNow ? "#ffdd00" : "#cccccc"}
          />
        ))}
      </div>
    </div>
  );
}

