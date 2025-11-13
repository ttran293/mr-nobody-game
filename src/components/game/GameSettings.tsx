export interface StorySettings {
  world: {
    era: string;
    yearStart: number;
    location: string;
    region: string;
    socioeconomicTone: string;
  };
  tone: {
    voice: string;
    moralLens: string;
  };
  lifeArc: {
    totalMainChapters: number;
    mortalityChances: { early: number; mid: number; late: number };
  };
  choices: {
    perChapter: number;
  };
  generation: {
    wordsPerChapter: [number, number];
  };
}


const pick = <T,>(arr: readonly T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// const pickMultiple = <T,>(arr: readonly T[], count: number): T[] => {
//   const shuffled = [...arr].sort(() => Math.random() - 0.5);
//   return shuffled.slice(0, Math.min(count, arr.length));
// };


export function generateRandomSettings(): StorySettings {
  const eras = ["late 20th and early 21st century"];
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
  const moralLenses = ["Realistic vs. Idealistic"];
  // const motifs = [
  //   "memory",
  //   "journey",
  //   "family",
  //   "friendship",
  //   "work",
  //   "school",
  //   "career",
  //   "health",
  // ];

  const era = pick(eras);
  const yearStart = randomInRange(1990, 2000);
  const totalChapters = 10;
  // const beatsPattern = Array.from({ length: totalChapters }, () =>
  //   pick(["neutral", "up", "down", "reflection"])
  // );

  return {
    world: {
      era,
      yearStart,
      location: pick(locationHints),
      region: pick(regions),
      socioeconomicTone: pick(socioeconomicTones),
    },
    tone: {
      voice: "restrained",
      moralLens: pick(moralLenses),
    },
    lifeArc: {
      totalMainChapters: totalChapters,
      mortalityChances: {
        early: Math.random() * 0.2,
        mid: Math.random() * 0.3,
        late: Math.random() * 0.5 + 0.5,
      },
    },
    choices: {
      perChapter: 3,
    },
    generation: {
      wordsPerChapter: [randomInRange(50, 80), randomInRange(80, 120)] as [
        number,
        number
      ],
    },
  };
}
