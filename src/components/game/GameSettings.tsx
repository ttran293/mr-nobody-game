export interface StorySettings {
  world: {
    era: string;
    yearStart: number;
    locationHint: string;
    region: string;
    socioeconomicTone: string;
    realism: string;
  };
  tone: {
    voice: string;
    moralLens: string;
    emotionalRange: { min: number; max: number };
  };
  lifeArc: {
    totalMainChapters: number;
    averageBranchDepth: number;
    beatsPattern: string[];
    mortalityChances: { early: number; mid: number; late: number };
  };
  choices: {
    perChapter: number;
    impactVariance: number;
    moralityAxis: string[];
  };
  aesthetics: {
    motifs: string[];
    endingTone: string;
  };
  generation: {
    wordsPerChapter: [number, number];
    forbidMetaphors: boolean;
    secondPerson: boolean;
    continuityDepth: number;
  };
}


const pick = <T,>(arr: readonly T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const pickMultiple = <T,>(arr: readonly T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
};


export function generateRandomSettings(): StorySettings {
  const eras = ["contemporary"];
  const regions = [
    "North America",
  ];
  const locationHints = [
    "suburban mid-sized city",
    "urban metropolis",
    "industrial city",
    "college town",
  ];
  const socioeconomicTones = [
    "lower_class",
    "working_class",
    "middle_class",
    "upper_middle_class",
    "upper_class",
  ];
  const realismLevels = ["grounded", "realistic"];
  const moralLenses = ["empathy", "justice", "duty", "freedom", "tradition"];
  const endingTones = [
    "bittersweet",
    "hopeful",
    "tragic",
    "ambiguous",
    "redemptive",
  ];
  const motifs = [
    "music",
    "memory",
    "letters",
    "journey",
    "family",
    "friendship",
    "work",
    "nature",
    "art",
    "technology",
  ];

  const era = pick(eras);
  const yearStart = randomInRange(1990, 2020);
  const totalChapters = 6;
  const beatsPattern = Array.from({ length: totalChapters }, () =>
    pick(["neutral", "up", "down", "reflection"])
  );

  return {
    world: {
      era,
      yearStart,
      locationHint: pick(locationHints),
      region: pick(regions),
      socioeconomicTone: pick(socioeconomicTones),
      realism: pick(realismLevels),
    },
    tone: {
      voice: "restrained",
      moralLens: pick(moralLenses),
      emotionalRange: {
        min: randomInRange(1, 5),
        max: randomInRange(5, 10),
      },
    },
    lifeArc: {
      totalMainChapters: totalChapters,
      averageBranchDepth: randomInRange(2, 4),
      beatsPattern,
      mortalityChances: {
        early: Math.random() * 0.2,
        mid: Math.random() * 0.3,
        late: Math.random() * 0.5 + 0.5,
      },
    },
    choices: {
      perChapter: 3,
      impactVariance: Math.random() * 0.5 + 0.5,
      moralityAxis: pickMultiple(
        ["self", "others", "truth", "duty", "freedom", "tradition"],
        3
      ),
    },
    aesthetics: {
      motifs: pickMultiple(motifs, randomInRange(2, 4)),
      endingTone: pick(endingTones),
    },
    generation: {
      wordsPerChapter: [
        randomInRange(50, 80),
        randomInRange(80, 120),
      ] as [number, number],
      forbidMetaphors: Math.random() > 0.3,
      secondPerson: true,
      continuityDepth: randomInRange(1, 3),
    },
  };
}
