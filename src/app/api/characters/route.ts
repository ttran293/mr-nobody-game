import { NextRequest, NextResponse } from "next/server";
import { Character, CharacterProps } from "@/lib/character";

// In-memory store for demo purposes. Replace with a database later.
const characters: Character[] = [];

// Seed one random character for testing on server start (per reload in dev)
if (characters.length === 0) {
  characters.push(Character.random());
}

export async function GET() {
  return NextResponse.json(characters.map((c) => c.toJSON()));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CharacterProps>;
    if (
      !body ||
      body.gender === undefined ||
      body.age === undefined ||
      body.emotion === undefined
    ) {
      return NextResponse.json(
        { error: "gender, age, and emotion are required" },
        { status: 400 }
      );
    }

    const character = Character.fromJSON({
      name: body.name,
      gender: body.gender as CharacterProps["gender"],
      age: Number(body.age),
      emotion: body.emotion as CharacterProps["emotion"],
      traits: Array.isArray(body.traits) ? body.traits : [],
    });
    characters.push(character);
    return NextResponse.json(character.toJSON(), { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}



