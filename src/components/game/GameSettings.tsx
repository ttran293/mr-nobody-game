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

import { faker } from '@faker-js/faker';

export interface Relationship {
  name: string;
  relationship_type: string;
  age: number;
}

export interface CharacterSettings {
  name: string;
  gender: string;
  relationship: Relationship[];
  heath_score: number;
  happiness_score: number;
  friend_score: number;
  career_score: number;
  family_score: number;
  wealth_score: number;
  openness_score: number;
  conscientiousness_score: number;
  extraversion_score: number;
  agreeableness_score: number;
  neuroticism_score: number;
  traits: string[];
  hobbies: string[];
}

const pick = <T,>(arr: readonly T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function selectMotifsForChapter(
  age: number,
): string[] {
  let ageMotifs: string[];
  if (age < 5) {
    ageMotifs = ["Family", "Play", "Learning", "Explore"];
  } else if (age < 12) {
    ageMotifs = ["Friendship", "School", "Curiosity", "Family", "First challenges"];
  } else if (age < 18) {
    ageMotifs = ["Identity", "Peer pressure", "First love", "Rebellion", "Academic pressure", "Independence"];
  } else if (age < 26) {
    ageMotifs = ["Career", "Self-discovery", "Romance", "Independence", "Life", "Risk-taking"];
  } else if (age < 41) {
    ageMotifs = ["Career", "Relationships", "Responsibility", "Work-life balance", "Starting a family", "Financial stability"];
  } else if (age < 61) {
    ageMotifs = ["Legacy", "Midlife reflection", "Health", "Mentorship", "Career", "Parenting"];
  } else {
    ageMotifs = ["Reflection", "Legacy", "Health decline", "Wisdom", "Loss", "Acceptance", "Memory"];
  }

  const selectedMotifs: string[] = [];

  const primaryMotif = pick(ageMotifs);
  selectedMotifs.push(primaryMotif);

  return selectedMotifs;
}

export function calculateDeathProbability(
  age: number,
  healthScore: number
): number {
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

    const ageNorm = clamp((age - 18) / 60, 0, 1);

    const healthNorm = clamp(healthScore / 100, 0, 1);


    const risk = 0.6 * ageNorm + 0.4 * (1 - healthNorm); 

    const k = 6; //
    const center = 0.5;
    const x = k * (risk - center);
    const maxP = 0.35;

    const probability = maxP / (1 + Math.exp(-x));
    return clamp(probability, 0, maxP);
}

export function checkForDeath(
  age: number,
  healthScore: number,
): { isDead: boolean; deathProbability: number } {
  const deathProbability = calculateDeathProbability(age, healthScore);
  const randomRoll = Math.random();
  const isDead = randomRoll < deathProbability;

  console.log(`Death check: Age ${age}, Health ${healthScore}, Probability ${(deathProbability * 100).toFixed(2)}%, Roll ${(randomRoll * 100).toFixed(2)}%, Result: ${isDead ? 'DEATH' : 'ALIVE'}`);

  return { isDead, deathProbability };
}

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

  const era = pick(eras);
  const yearStart = randomInRange(1990, 2000);
  const totalChapters = 15;
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

export function generateRandomCharacter(): CharacterSettings {
  const gender = pick(["male", "female"]);
  const firstName = faker.person.firstName(gender as 'male' | 'female');
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  
  return {
    name: fullName,
    gender: gender,
    relationship: [
      {
        name: `${faker.person.firstName("female")} ${lastName}`,
        relationship_type: 'mother',
        age: randomInRange(30, 50),
      },
      {
        name: `${faker.person.firstName("male")} ${lastName}`,
        relationship_type: 'father',
        age: randomInRange(30, 50),
      },
    ],
    heath_score: randomInRange(80, 100),
    happiness_score: 100,
    friend_score: 0,
    career_score: 0,
    family_score: randomInRange(50, 100),
    wealth_score: 0,
    openness_score: 50,
    conscientiousness_score: 50,
    extraversion_score: 50,
    agreeableness_score: 50,
    neuroticism_score: 50,
    traits: [],
    hobbies: [],
  };
}