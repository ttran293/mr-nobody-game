"use client";
import { useState, useEffect, useRef } from "react";
import { useGameSettings } from "./GameSettingsContext";
import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const getScoreColor = (score: number): string => {
  if (score < 25) return "bg-red-500";
  if (score < 50) return "bg-orange-500";
  if (score < 75) return "bg-lime-500";
  return "bg-green-500";
};

interface StatBarProps {
  label: string;
  value: number;
  tooltip?: string;
}

const StatBar = ({ label, value, tooltip }: StatBarProps) => {
  const [indicators, setIndicators] = useState<{ id: number; value: string; color: string }[]>([]);
  const prevValue = useRef<number>(value);
  const indicatorId = useRef(0);

  useEffect(() => {
    const diff = value - prevValue.current;
    if (diff !== 0) {
      const id = indicatorId.current++;
      const color = diff > 0 ? "text-green-400" : "text-red-400";
      const sign = diff > 0 ? "+" : "";
      setIndicators(prev => [...prev, { id, value: `${sign}${diff}`, color }]);

      setTimeout(() => {
        setIndicators(prev => prev.filter(i => i.id !== id));
      }, 1000);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <div className="flex flex-col gap-1.5 relative">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex">
                <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ${getScoreColor(value)}`}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
          {indicators.map(i => (
            <span
              key={i.id}
              className={`absolute left-1/2 -translate-x-1/2 text-sm font-bold animate-float ${i.color}`}
            >
              {i.value}
            </span>
          ))}
        </div>
        <span className="text-sm font-semibold tabular-nums w-8">{value}</span>
      </div>
    </div>
  );
};

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-base font-semibold mb-2.5 text-foreground">{children}</h4>
);

interface CharacterInfoProps {
  age?: number;
}

export function CharacterInfo({ age }: CharacterInfoProps) {
  const { character } = useGameSettings();

  if (!character) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading character...</p>
      </div>
    );
  }

  const personalityTraits = [
    {
      key: "openness_score",
      label: "Openness",
      tooltip:
        "Measures creativity, curiosity, and willingness to entertain new ideas",
    },
    {
      key: "conscientiousness_score",
      label: "Conscientiousness",
      tooltip: "Measures self-control, diligence, and attention to detail",
    },
    {
      key: "extraversion_score",
      label: "Extraversion",
      tooltip: "Measures boldness, energy, and social interactivity",
    },
    {
      key: "agreeableness_score",
      label: "Agreeableness",
      tooltip: "Measures kindness, helpfulness, and willingness to cooperate",
    },
    {
      key: "neuroticism_score",
      label: "Neuroticism",
      tooltip: "Measures depression, irritability, and moodiness",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center pb-3 border-b">
        <h3 className="text-2xl font-bold">{character.name.split(" ")[0]}</h3>
        <div className="flex items-center justify-center gap-3 mt-1.5">
          <p className="text-sm text-muted-foreground capitalize">{character.gender}</p>
          {age !== undefined && (
            <>
              <span className="text-muted-foreground">•</span>
              <p className="text-sm font-semibold tabular-nums text-muted-foreground capitalize">
                <span className="text-yellow-500">{age}</span> years old
              </p>
            </>
          )}
        </div>
      </div>

      <section>
        <SectionHeader>Main Attributes</SectionHeader>
        <div className="grid grid-cols-2 gap-3">
          <StatBar label="Health" value={character.heath_score} />
          <StatBar label="Family" value={character.family_score} />
          <StatBar label="Friend" value={character.friend_score} />
          <StatBar label="Career" value={character.career_score} />
          <StatBar label="Wealth" value={character.wealth_score} />
        </div>
      </section>

      <section>
        <SectionHeader>Personality Traits</SectionHeader>
        <div className="grid grid-cols-2 gap-3">
          {personalityTraits.map(({ key, label, tooltip }) => (
            <StatBar
              key={key}
              label={label}
              value={character[key as keyof typeof character] as number}
              tooltip={tooltip}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader>Relationships</SectionHeader>
        {character.relationship.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {character.relationship.map((rel, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1.5 bg-secondary/80 rounded-full capitalize font-medium"
              >
                {rel.name.split(" ")[0]} ({rel.relationship_type})
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No relationships</p>
        )}
      </section>

      <section>
        <SectionHeader>Hobbies</SectionHeader>
        {character.hobbies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {character.hobbies.map((hobby, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1.5 bg-accent/80 text-accent-foreground rounded-full font-medium"
              >
                {hobby}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No hobbies</p>
        )}
      </section>
    </div>
  );
}
