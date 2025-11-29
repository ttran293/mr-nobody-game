import type { CharacterSettings } from "./GameSettings";

export interface ChoiceImpacts {
  heath_score?: number;
  family_score?: number;
  friend_score?: number;
  career_score?: number;
  wealth_score?: number;
  openness_score?: number;
  conscientiousness_score?: number;
  extraversion_score?: number;
  agreeableness_score?: number;
  neuroticism_score?: number;
}

export interface Choice {
  id: string;
  text: string;
  next: string;
  impacts?: ChoiceImpacts;
}

export interface AlternativeTimeline {
  pivotAge: number;
  actualChoice: string;
  alternativeChoice: string;
  narrative: string;
}

export interface Chapter {
  id: string;
  text: string;
  age: number;
  choices?: Choice[];
  motifs?: string[];
  chapterNumber?: number;
  totalChapters?: number;
  lifeSummary?: string;
  alternativeTimelines?: AlternativeTimeline[];
}

export interface Decision {
  chapterId: string;
  choiceId: string;
  choiceText: string;
  chapterAge: number;
  untakenChoices: Array<{
    id: string;
    text: string;
    next: string;
  }>;
  characterBefore?: CharacterSettings;
}

