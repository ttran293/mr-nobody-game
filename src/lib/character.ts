export type Gender = "male" | "female";
export type Emotion =
  | "happy"
  | "sad"
  | "angry";

export interface CharacterProps {
  id?: string;
  name?: string;
  gender: Gender;
  age: number;
  emotion: Emotion;
  traits?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class Character {
  readonly id: string;
  name?: string;
  gender: Gender;
  age: number;
  emotion: Emotion;
  traits: string[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: CharacterProps) {
    Character.assertValid(props);
    this.id = props.id ?? crypto.randomUUID();
    this.name = props.name;
    this.gender = props.gender;
    this.age = Math.floor(props.age);
    this.emotion = props.emotion;
    this.traits = props.traits?.slice() ?? [];
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this._updatedAt = props.updatedAt ? new Date(props.updatedAt) : this.createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  setEmotion(emotion: Emotion): void {
    this.emotion = emotion;
    this.touch();
  }

  setAge(age: number): void {
    if (!Number.isFinite(age) || age < 0) throw new Error("Age must be non-negative");
    this.age = Math.floor(age);
    this.touch();
  }

  setName(name?: string): void {
    this.name = name?.trim() || undefined;
    this.touch();
  }

  addTrait(trait: string): void {
    const t = trait.trim();
    if (t && !this.traits.includes(t)) {
      this.traits.push(t);
      this.touch();
    }
  }

  removeTrait(trait: string): void {
    const before = this.traits.length;
    this.traits = this.traits.filter((t) => t !== trait);
    if (this.traits.length !== before) this.touch();
  }

  toJSON(): CharacterProps {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      age: this.age,
      emotion: this.emotion,
      traits: this.traits.slice(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  static fromJSON(raw: CharacterProps): Character {
    return new Character(raw);
  }

  static random(): Character {
    const genders: Gender[] = ["male", "female"];
    const emotions: Emotion[] = ["happy", "sad", "angry"];
    const maleNames = ["Alex", "Ben", "Chris", "Dan", "Ethan"];
    const femaleNames = ["Alice", "Beth", "Clara", "Diana", "Eva"];
    const traitPool = [
      "guitarist",
      "studious",
      "athletic",
      "creative",
      "leader",
      "introvert",
      "extrovert",
    ];

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const gender = pick(genders);
    const name = gender === "male" ? pick(maleNames) : pick(femaleNames);
    const age = Math.floor(Math.random() * 43) + 13; // 13-55
    const emotion = pick(emotions);
    const traits = traitPool
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3));
    
    console.log(gender, age, emotion, name, traits);
    return new Character({ gender, age, emotion, name, traits });
  }

  static assertValid(props: CharacterProps): void {
    const genders: Gender[] = ["male", "female"];
    const emotions: Emotion[] = [
      "happy",
      "sad",
      "angry",
    ];
    if (!genders.includes(props.gender)) throw new Error("Invalid gender");
    if (!Number.isFinite(props.age) || props.age < 0) throw new Error("Age must be non-negative");
    if (!emotions.includes(props.emotion)) throw new Error("Invalid emotion");
    if (props.traits && !Array.isArray(props.traits)) throw new Error("Traits must be an array");
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}


