import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { Chapter } from "@/components/game/types";
import { type StorySettings, type CharacterSettings, selectMotifsForChapter } from "@/components/game/GameSettings";
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
    const { settings, character } = (await req.json()) as { 
      settings: StorySettings;
      character?: CharacterSettings;
    };
    console.log(settings);
    console.log(character);
    
    const characterContext = character 
      ? `The protagonist is ${character.name}, a ${character.gender}. 
         Main Attributes - Health: ${character.heath_score}/100, Family: ${character.family_score}/100, Friend: ${character.friend_score}/100, Career: ${character.career_score}/100, Wealth: ${character.wealth_score}/100.
         Personality Traits - Openness: ${character.openness_score}/100, Conscientiousness: ${character.conscientiousness_score}/100, Extraversion: ${character.extraversion_score}/100, Agreeableness: ${character.agreeableness_score}/100, Neuroticism: ${character.neuroticism_score}/100.
         ${character.hobbies.length > 0 ? `Hobbies: ${character.hobbies.join(", ")}.` : ""}
         Family: ${character.relationship.map(r => `${r.name} (${r.relationship_type}, age ${r.age})`).join(", ")}.`
      : "";

    // Select motifs for the opening chapter
    const motifs = selectMotifsForChapter(0);
    console.log("Chapter 1 motifs:", motifs);

    const prompt = `Write the opening chapter of a branching, cinematic story about a person's life.
    ${characterContext}
    
    Thematic Focus (Motifs): ${motifs.join(", ")}
    - Weave these themes naturally into the narrative
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
    - Let the motifs guide the emotional tone but keep it subtle and natural.
    ${character ? `- Introduce the family members: ${character.relationship.map(r => r.name + " (" + r.relationship_type + ")").join(", ")}.` : ""}

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
      motifs: motifs,
      chapterNumber: 1,
      totalChapters: settings.lifeArc.totalMainChapters,
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
