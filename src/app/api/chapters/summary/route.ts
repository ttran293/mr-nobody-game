import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { Chapter, Decision } from "@/components/game/types";
import type { CharacterSettings } from "@/components/game/GameSettings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      character: CharacterSettings;
      initialCharacter: CharacterSettings;
      decisions: Decision[];
      chapters: Record<string, Chapter>;
      finalAge: number;
      isDeath?: boolean;
    };

    const { character, initialCharacter, decisions, chapters, finalAge, isDeath } = body;

    if (!character || !decisions || !chapters) {
      return NextResponse.json(
        { error: "character, decisions, and chapters are required" },
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

    const journeyContext = decisions.map((decision, index) => {
      const age = decision.chapterAge;
      const choiceText = decision.choiceText;
      const untakenChoices = decision.untakenChoices.map(c => c.text).join("; ");
      
      return `Age ${age} (Chapter ${index + 1}): Chose "${choiceText}"${untakenChoices ? ` (Didn't choose: ${untakenChoices})` : ""}`;
    }).join("\n");

    // calculate how the main attributes changed over the life.
    const attributeChanges = {
      health: character.heath_score - initialCharacter.heath_score,
      family: character.family_score - initialCharacter.family_score,
      friend: character.friend_score - initialCharacter.friend_score,
      career: character.career_score - initialCharacter.career_score,
      wealth: character.wealth_score - initialCharacter.wealth_score,
    };

    const personalityDevelopment = {
      openness: character.openness_score - initialCharacter.openness_score,
      conscientiousness: character.conscientiousness_score - initialCharacter.conscientiousness_score,
      extraversion: character.extraversion_score - initialCharacter.extraversion_score,
      agreeableness: character.agreeableness_score - initialCharacter.agreeableness_score,
      neuroticism: character.neuroticism_score - initialCharacter.neuroticism_score,
    };

    const summaryPrompt = `Generate a comprehensive life summary for this character's journey.

    Character: ${character.name} (${character.gender})
    Life Span: Birth to Age ${finalAge}${isDeath ? " (Sudden Death)" : " (Natural Life Completion)"}

    STARTING STATE (Birth):
    - Health: ${initialCharacter.heath_score}/100
    - Family bonds: ${initialCharacter.family_score}/100
    - Initial family: ${initialCharacter.relationship.map(r => `${r.name} (${r.relationship_type})`).join(", ")}

    FINAL STATE (Age ${finalAge}):
    Main Attributes:
    - Health: ${character.heath_score}/100 (${attributeChanges.health > 0 ? '+' : ''}${attributeChanges.health})
    - Family: ${character.family_score}/100 (${attributeChanges.family > 0 ? '+' : ''}${attributeChanges.family})
    - Friend: ${character.friend_score}/100 (${attributeChanges.friend > 0 ? '+' : ''}${attributeChanges.friend})
    - Career: ${character.career_score}/100 (${attributeChanges.career > 0 ? '+' : ''}${attributeChanges.career})
    - Wealth: ${character.wealth_score}/100 (${attributeChanges.wealth > 0 ? '+' : ''}${attributeChanges.wealth})

    Personality Development:
    - Openness: ${character.openness_score}/100 (${personalityDevelopment.openness > 0 ? '+' : ''}${personalityDevelopment.openness})
    - Conscientiousness: ${character.conscientiousness_score}/100 (${personalityDevelopment.conscientiousness > 0 ? '+' : ''}${personalityDevelopment.conscientiousness})
    - Extraversion: ${character.extraversion_score}/100 (${personalityDevelopment.extraversion > 0 ? '+' : ''}${personalityDevelopment.extraversion})
    - Agreeableness: ${character.agreeableness_score}/100 (${personalityDevelopment.agreeableness > 0 ? '+' : ''}${personalityDevelopment.agreeableness})
    - Neuroticism: ${character.neuroticism_score}/100 (${personalityDevelopment.neuroticism > 0 ? '+' : ''}${personalityDevelopment.neuroticism})

    Relationships Built: ${character.relationship.length > 2 ? character.relationship.slice(2).map(r => `${r.name} (${r.relationship_type})`).join(", ") : "None beyond family"}
    Hobbies Developed: ${character.hobbies.length > 0 ? character.hobbies.join(", ") : "None"}

    LIFE JOURNEY (Key Decisions Made):
    ${journeyContext}

    TASK:
    Write a comprehensive life summary that:
    1. Opens with an overview of their life span and how it ended
    2. Reviews major decisions and their consequences (reference specific ages and choices)
    3. Analyzes how their personality developed based on the scores (mention specific traits that grew or declined)
    4. Discusses their relationships - who they connected with, who they lost touch with
    5. Evaluates their achievements in different life areas (career, family, friendships, health, wealth)
    6. Reflects on paths not taken (untaken choices) and how life might have been different
    7. Identifies 2-3 defining moments that shaped who they became
    8. Concludes with an overall assessment of their life's meaning and legacy

    Requirements:
    - Use second person ("You...")
    - 4-6 paragraphs, approximately 400-600 words total
    - Analytical and reflective tone, like a biography
    - Reference specific ages and decisions from the journey
    - Discuss trade-offs they made (high career but low family, etc.)
    - Be honest about both successes and failures
    - Consider how their choices shaped their personality development
    - Make it personal and unique to their specific journey
    - No flowery language, keep it grounded and realistic

    Output only the summary text.`;

    console.log("Generating life summary...");

    const llm = new ChatOpenAI({
      apiKey: token,
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      temperature: 0.7,
      configuration: { baseURL: "https://api.deepinfra.com/v1/openai" },
    });

    const summaryResponse = await llm.invoke([
      new SystemMessage("You are a thoughtful biographer analyzing a person's life journey."),
      new HumanMessage(summaryPrompt),
    ]);

    const summaryText =
      typeof summaryResponse.content === "string"
        ? summaryResponse.content
        : summaryResponse.content
            .map((p: unknown) =>
              typeof p === "object" && p !== null && "text" in p
                ? (p as { text: string }).text
                : ""
            )
            .join("")
            .trim();

    return NextResponse.json({ summary: summaryText }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

