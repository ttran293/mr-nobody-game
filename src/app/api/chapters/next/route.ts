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

    const storyPrompt = `Continue the story of this person's life.
    - Use the context of the settings to generate the story.
    - The context of the settings is:
    - Era: ${settings?.world?.era}
    - Year Start: ${settings?.world?.yearStart}
    - Location: ${settings?.world?.location}
    - Region: ${settings?.world?.region}
    - Socioeconomic Tone: ${settings?.world?.socioeconomicTone}

    
    Previous chapter (age ${previousChapter.age}): "${previousChapter.text}"
    ${decision.choiceText !== "Next" ? `Player's choice: "${decision.choiceText}"` : ""}

    The character is now age ${nextAge}. Write a chapter that naturally flows from the previous chapter and the decision.
    The chapter must match the time skip between the previous chapter and this chapter.
    The chapter must be realistic and grounded.
    Introduce new relationships and interactions with the people to shape the character's life such as family, friends, acquaintances, significant others, etc.
    The relationship must match the character's age and context.

    Requirements:
    - Use second person ("You...")
    - Two paragraphs, 150-200 words.
    - The first paragraph should only be a few sentences. It should be about previous chapter, the previous decision, and the consequences of the previous choice.
    - The second paragraph can set up the current meaningful milestone in their life.
    - Stay realistic and grounded
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
    - Each choice should present a distinct path forward.
    - Choices should have realistic consequences and emotional weight.
    - Choices should have realistic risks and rewards.
    - Choices should have potential long-term consequences whether positive or negative.
    - Keep choice text short (10-20 words max)
    - Make them realistic and grounded in the context of the story
    - Actions must be realistic with the character's age and context
    - Actions must match a commonsense approach to the character's age and context
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
    console.log(choicesText);
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
      const endingPrompt = `
      
      Write the final chapter (ending) of this coming-of-age story.

    The character is now age ${nextAge}. This is the final chapter of their story arc.

    Requirements:
    - Use second person ("You...")
    - One paragraph, 100-150 words
    - Realistic, grounded, emotionally restrained — not poetic or abstract
    - Show the culmination of their life journey
    - Reflect on the path they've taken
    - End with a sense of closure
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

