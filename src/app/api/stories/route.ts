import { NextRequest, NextResponse } from "next/server";
import { Story, StoryProps } from "@/lib/story";

// In-memory store for demo purposes. Replace with a database later.
const stories: Story[] = [];

// Seed one random story for testing on server start (per reload in dev)
if (stories.length === 0) {
  stories.push(Story.random());
}

export async function GET() {
  return NextResponse.json(stories.map((s) => s.toJSON()));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<StoryProps>;
    if (
      !body ||
      body.text === undefined
    ) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const story = Story.fromJSON({
      text: body.text,
    });
    stories.push(story);
    return NextResponse.json(story.toJSON(), { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}



