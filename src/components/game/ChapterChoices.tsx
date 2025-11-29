import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Choice } from "./types";

interface ChapterChoicesProps {
  choices: Choice[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export function ChapterChoices({
  choices,
  selected,
  onSelect,
}: ChapterChoicesProps) {
  if (choices.length === 0) return null;

  return (
    <RadioGroup value={selected ?? ""} onValueChange={onSelect}>
      {choices.map((choice) => (
        <div key={choice.id} className="flex items-center gap-3">
          <RadioGroupItem
            value={choice.id}
            id={choice.id}
            className="cursor-pointer"
          />
          <Label htmlFor={choice.id} className="text-lg font-lexend">
            {choice.text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

