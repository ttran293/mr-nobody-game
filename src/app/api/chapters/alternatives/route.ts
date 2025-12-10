import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { Decision } from "@/components/game/types";
import type { CharacterSettings } from "@/components/game/GameSettings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      character: CharacterSettings;
      decisions: Decision[];
      finalAge: number;
    };

    const { character, decisions, finalAge } = body;

    if (!character || !decisions || decisions.length === 0) {
      return NextResponse.json(
        { error: "character and decisions are required" },
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

    const decisionsWithAlternatives = decisions.filter(d => d.untakenChoices.length > 0);
    
    if (decisionsWithAlternatives.length === 0) {
      return NextResponse.json(
        { alternatives: [] },
        { status: 200 }
      );
    }

    const shuffled = [...decisionsWithAlternatives].sort(() => Math.random() - 0.5);
    const significantDecisions = shuffled.slice(0, 2);

    if (significantDecisions.length === 0) {
      return NextResponse.json(
        { alternatives: [] },
        { status: 200 }
      );
    }

    const llm = new ChatOpenAI({
      apiKey: token,
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      temperature: 0.8,
      configuration: { baseURL: "https://api.deepinfra.com/v1/openai" },
    });

    const alternativePromises = significantDecisions.map(async (pivotDecision) => {
      const randomIndex = Math.floor(Math.random() * pivotDecision.untakenChoices.length);
      const alternativeChoice = pivotDecision.untakenChoices[randomIndex]; 
      
      const alternativePrompt = `Generate an alternative life outcome based on a different decision.

      Character: ${character.name} (${character.gender})
      Actual Life Outcome: Lived to age ${finalAge}

      ACTUAL DECISION MADE (at age ${pivotDecision.chapterAge}):
      "${pivotDecision.choiceText}"

      ALTERNATIVE PATH (what if they chose instead):
      "${alternativeChoice.text}"

      OTHER OPTIONS THEY DIDN'T TAKE:
      ${pivotDecision.untakenChoices.filter(c => c.text !== alternativeChoice.text).map(c => `- "${c.text}"`).join('\n')}

      ACTUAL LIFE RESULTS:
      - Health: ${character.heath_score}/100
      - Family: ${character.family_score}/100
      - Friends: ${character.friend_score}/100
      - Career: ${character.career_score}/100
      - Wealth: ${character.wealth_score}/100
      - Relationships: ${character.relationship.length} people
      - Hobbies: ${character.hobbies.join(", ") || "None"}

      TASK:
      Write a speculative "what if" narrative describing how their life would have unfolded differently if they had chosen "${alternativeChoice.text}" at age ${pivotDecision.chapterAge}.

      Requirements:
      1. Start with: "If at age ${pivotDecision.chapterAge}, ${character.name} had chosen to ${alternativeChoice.text.toLowerCase()}..."
      2. Describe how this single decision would have created a cascade of different events
      3. Imagine different relationships they would have formed/lost
      4. Speculate on different career paths, life choices, personality development
      5. Estimate how their final attributes might have been different (be specific with scores)
      6. Describe potential hobbies and interests they might have developed
      7. Conclude with how old they might have lived to and how their life would have ended differently
      8. Keep it realistic and grounded - not necessarily better or worse, just different
      9. Show the butterfly effect - how one choice ripples through time
      10. Use second person ("you", "your")
      11. 2-3 paragraphs, approximately 200-300 words

      Output only the alternative timeline narrative.`;
      console.log("Alternative prompt:", alternativePrompt); 


      const response = await llm.invoke([
        new SystemMessage("You are a creative writer specializing in alternate timeline narratives."),
        new HumanMessage(alternativePrompt),
      ]);

      const alternativeText =
        typeof response.content === "string"
          ? response.content
          : response.content
              .map((p: unknown) =>
                typeof p === "object" && p !== null && "text" in p
                  ? (p as { text: string }).text
                  : ""
              )
              .join("")
              .trim();

      return {
        pivotAge: pivotDecision.chapterAge,
        actualChoice: pivotDecision.choiceText,
        alternativeChoice: alternativeChoice.text,
        narrative: alternativeText,
      };
    });

    const alternatives = await Promise.all(alternativePromises);

    console.log(`Generated ${alternatives.length} alternative timelines`);

    return NextResponse.json({ alternatives }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate alternatives";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

