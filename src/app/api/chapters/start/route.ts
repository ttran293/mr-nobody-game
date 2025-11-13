import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { Chapter } from "@/components/game/types";
import { type StorySettings } from "@/components/game/GameSettings";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = process.env.DEEPINFRA_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "DEEPINFRA_TOKEN is not set" },
        { status: 500 }
      );
    }
    const { settings } = (await req.json()) as { settings: StorySettings };
    console.log(settings);
    const prompt = `Write the opening chapter of a branching, cinematic story about a person's life.
    - Use the context of the settings to generate the story.
    - The context of the settings is:
    - Era: ${settings.world.era}
    - Year Start: ${settings.world.yearStart}
    - Location: ${settings.world.location}
    - Region: ${settings.world.region}
    - Socioeconomic Tone: ${settings.world.socioeconomicTone}
    - Use second person ("You..."), not first person ("I").
    - Keep it one short paragraph around 120 words.
    - Make it realistic, grounded, and emotionally restrained.
    - Describe the moment of birth and the setting of the story.

    Output only the short paragraph of narrative text.
    `;

    const llm = new ChatOpenAI({
      apiKey: token,
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      temperature: 0.8,
      configuration: { baseURL: "https://api.deepinfra.com/v1/openai" },
    });

    const res = await llm.invoke([
      new SystemMessage("You are a creative story generator."),
      new HumanMessage(prompt),
    ]);

    const content =
      typeof res.content === "string"
        ? res.content
        : res.content
            .map((p: unknown) =>
              typeof p === "object" && p !== null && "text" in p
                ? (p as { text: string }).text
                : ""
            )
            .join("")
            .trim();

    const chapter: Chapter = {
      id: "chapter_1",
      text: content,
      age: 0,
      choices: [
        {
          id: "choice_1",
          text: "Next",
          next: "chapter_2",
        },
      ],
    };

    return NextResponse.json(chapter, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate chapter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
