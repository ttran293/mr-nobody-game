export const randomStories = [
  "Snow drifts outside the library. Your best friend's birthday party starts soon, but your group project is unfinished. Go celebrate and risk the grade, or stay behind and finish it alone?",
  "Your school's talent show is tomorrow. You've been practicing your song for weeks, but you're nervous about performing in front of everyone. Do you go on stage and risk being judged, or skip it and avoid the spotlight?",
  "Your band's first gig is tonight. You've been practicing for months, but you're nervous about performing in front of everyone. Do you go on stage and risk being judged, or skip it and avoid the spotlight?",
] as const;

export interface StoryProps {
  id?: string;
  text?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class Story {
  readonly id: string;
  text?: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: StoryProps) {
    this.id = props.id ?? crypto.randomUUID();
    this.text = props.text;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this._updatedAt = props.updatedAt ? new Date(props.updatedAt) : this.createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  setText(text?: string): void {
    this.text = text?.trim() || undefined;
    this.touch();
  }

  toJSON(): StoryProps {
    return {
      id: this.id,
      text: this.text,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  static fromJSON(raw: StoryProps): Story {
    return new Story(raw);
  }

  static random(): Story {
    const stories = randomStories as readonly string[];
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const text = pick(stories) as string;
    console.log(text);
    return new Story({ text: text as string | undefined });
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}