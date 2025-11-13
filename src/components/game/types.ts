export interface Choice {
  id: string;
  text: string;
  next: string;
}

export interface Chapter {
  id: string;
  text: string;
  age: number;
  choices?: Choice[];
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
}

