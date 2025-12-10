import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Choice } from "./types";

interface ChapterChoicesProps {
  choices: Choice[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export function ChapterChoices({ choices, selected, onSelect }: ChapterChoicesProps) {
  if (choices.length === 0) return null;

  return (
    <RadioGroup value={selected ?? ""} onValueChange={onSelect}>
      {choices.map((choice) => {
        const isSelected = selected === choice.id;
        return (
          <div
            key={choice.id}
            className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
              ${
                isSelected
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 "
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800 "
              }
            `}
          >
            <RadioGroupItem
              value={choice.id}
              id={choice.id}
              className={`cursor-pointer transition-colors duration-200
                ${isSelected ? "border-blue-600 dark:border-blue-400" : ""}
                group-hover:border-blue-600 dark:group-hover:border-blue-400
              `}
            />
            <Label
              htmlFor={choice.id}
              className={`text-lg font-lexend transition-colors duration-200 cursor-pointer
                ${isSelected ? "text-blue-700 dark:text-blue-300" : "group-hover:text-blue-600 dark:group-hover:text-blue-400"}
              `}
            >
              {choice.text}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
