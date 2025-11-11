import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { Chapter, Decision } from "@/components/game/types";
import type { StorySettings } from "@/components/game/GameSettings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      previousChapter: Chapter;
      decision: Decision;
      character?: { gender?: string; traits?: string[] };
      nextChapterId: string;
      settings?: StorySettings;
    };

    const { previousChapter, decision, character, nextChapterId, settings } = body;

    if (!previousChapter || !decision || !nextChapterId) {
      return NextResponse.json(
        { error: "previousChapter, decision, and nextChapterId are required" },
        { status: 400 }
      );
    }

    const token = process.env.DEEPINFRA_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "DEEPINFRA_TOKEN is not set" },
        { status: 500 }
      );
    }

    const ageIncrement = Math.floor(Math.random() * 4) + 3;
    const nextAge = previousChapter.age + ageIncrement;

    const characterContext = character
      ? `Character context: ${character.gender}, traits: ${character.traits?.join(", ") || "none"}.`
      : "";

    const storyPrompt = `Continue a branching, cinematic coming-of-age story.

    Previous chapter (age ${previousChapter.age}): "${previousChapter.text}"
    Player's choice: "${decision.choiceText}"
    ${characterContext}

    The character is now age ${nextAge}. Write the next chapter that naturally flows from this decision.
    The chapter must match the time skip between the previous chapter and the next chapter.

    Requirements:
    - Use second person ("You...")
    - One paragraph, 80-120 words
    - Realistic, grounded, emotionally restrained — not poetic or abstract
    - Show consequences of the previous choice
    - Set up the next meaningful moment in their life
    - No flowery metaphors or cosmic language

    Output only the narrative text, no choices.`;

    console.log(storyPrompt);

    const llm = new ChatOpenAI({
      apiKey: token,
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      temperature: 0.8,
      configuration: { baseURL: "https://api.deepinfra.com/v1/openai" },
    });

    const storyResponse = await llm.invoke([
      new SystemMessage("You are a creative story generator."),
      new HumanMessage(storyPrompt),
    ]);

    const storyText =
      typeof storyResponse.content === "string"
        ? storyResponse.content
        : storyResponse.content
            .map((p: unknown) =>
              typeof p === "object" && p !== null && "text" in p
                ? (p as { text: string }).text
                : ""
            )
            .join("")
            .trim();

    const choicesPrompt = `Based on this story chapter, generate exactly 3 meaningful choices for the character's age and context:

    "${storyText}"

    Requirements:
    - Each choice should present a distinct path forward
    - Choices should have real consequences and emotional weight
    - Keep choice text short (5-10 words max)
    - Make them realistic and grounded
    - Actions must be realistic with the character's age and context
    - Return ONLY a JSON array in this format:
    [
      { "text": "Choice 1 text" },
      { "text": "Choice 2 text" },
      { "text": "Choice 3 text" }
    ]

    No other text, just the JSON array.`;
    console.log(choicesPrompt);

    const choicesResponse = await llm.invoke([
      new SystemMessage(
        "You are a creative story generator. Always return ONLY valid JSON arrays."
      ),
      new HumanMessage(choicesPrompt),
    ]);

    const choicesText =
      typeof choicesResponse.content === "string"
        ? choicesResponse.content
        : choicesResponse.content
            .map((p: unknown) =>
              typeof p === "object" && p !== null && "text" in p
                ? (p as { text: string }).text
                : ""
            )
            .join("")
            .trim();

    let choicesData: { text: string }[] = [];
    try {
      const jsonMatch = choicesText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : choicesText;
      choicesData = JSON.parse(jsonText);
    } catch (parseError) {
      choicesData = [
        { text: "Continue forward" },
        { text: "Take a different path" },
        { text: "Reflect on the past" },
      ];
    }

    const chapterNumber = parseInt(
      nextChapterId.replace("chapter_", "").replace("ending_", "")
    ) || 2;
    const totalChapters = settings?.lifeArc?.totalMainChapters || 10;

    const isEnding = chapterNumber >= totalChapters;

    if (isEnding) {
      const endingPrompt = `Write the final chapter (ending) of this coming-of-age story.

    Previous chapter (age ${previousChapter.age}): "${previousChapter.text}"
    Player's choice: "${decision.choiceText}"
    ${characterContext}

    The character is now age ${nextAge}. This is the final chapter of their story arc.

    Requirements:
    - Use second person ("You...")
    - One paragraph, 100-150 words
    - Realistic, grounded, emotionally restrained — not poetic or abstract
    - Show the culmination of their life journey
    - Reflect on the path they've taken
    - End with a sense of closure
    - Match the ending tone: ${settings?.aesthetics?.endingTone || "bittersweet"}
    - No flowery metaphors or cosmic language

    Output only the narrative text, no choices.`;

      const endingResponse = await llm.invoke([
        new SystemMessage("You are a creative story generator."),
        new HumanMessage(endingPrompt),
      ]);

      const endingText =
        typeof endingResponse.content === "string"
          ? endingResponse.content
          : endingResponse.content
              .map((p: unknown) =>
                typeof p === "object" && p !== null && "text" in p
                  ? (p as { text: string }).text
                  : ""
              )
              .join("")
              .trim();

      const endingId = nextChapterId.startsWith("ending_")
        ? nextChapterId
        : `ending_${chapterNumber}`;

      const endingChapter: Chapter = {
        id: endingId,
        text: endingText,
        age: nextAge,
        choices: [],
      };

      return NextResponse.json(endingChapter, { status: 200 });
    }

    const choices = choicesData.slice(0, 3).map((choice, index) => {
      const nextId = `chapter_${chapterNumber + index + 1}`;
      return {
        id: `choice_${index + 1}`,
        text: choice.text,
        next: nextId,
      };
    });

    const chapter: Chapter = {
      id: nextChapterId,
      text: storyText,
      age: nextAge,
      choices,
    };

    return NextResponse.json(chapter, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate chapter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

