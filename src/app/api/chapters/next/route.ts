import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { Chapter, Decision, ChoiceImpacts } from "@/components/game/types";
import type { StorySettings, CharacterSettings } from "@/components/game/GameSettings";
import { selectMotifsForChapter, checkForDeath } from "@/components/game/GameSettings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      previousChapter: Chapter;
      decision: Decision;
      character?: CharacterSettings;
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

    const ageIncrement = Math.floor(Math.random() * 4) + 5; // randomly advance the age by 5–8 years.
    const nextAge = previousChapter.age + ageIncrement;

    const chapterNumber = parseInt(
      nextChapterId.replace("chapter_", "").replace("ending_", "")
    ) || 2;
    const totalChapters = settings?.lifeArc?.totalMainChapters || 15;
    const isEnding = chapterNumber >= totalChapters;
    const isApproachingEnd = chapterNumber >= totalChapters - 2;
    const chaptersRemaining = totalChapters - chapterNumber;

    let updatedCharacter = character ? { ...character } : undefined;
    if (updatedCharacter && previousChapter.choices) {
      const selectedChoice = previousChapter.choices.find(c => c.id === decision.choiceId);
      if (selectedChoice?.impacts) {
        const impacts = selectedChoice.impacts;
        
        const applyImpact = (current: number, impact: number = 0): number => {
          return Math.max(0, Math.min(100, current + impact));
        };

        updatedCharacter = {
          ...updatedCharacter,
          heath_score: applyImpact(updatedCharacter.heath_score, impacts.heath_score),
          family_score: applyImpact(updatedCharacter.family_score, impacts.family_score),
          friend_score: applyImpact(updatedCharacter.friend_score, impacts.friend_score),
          career_score: applyImpact(updatedCharacter.career_score, impacts.career_score),
          wealth_score: applyImpact(updatedCharacter.wealth_score, impacts.wealth_score),
          openness_score: applyImpact(updatedCharacter.openness_score, impacts.openness_score),
          conscientiousness_score: applyImpact(updatedCharacter.conscientiousness_score, impacts.conscientiousness_score),
          extraversion_score: applyImpact(updatedCharacter.extraversion_score, impacts.extraversion_score),
          agreeableness_score: applyImpact(updatedCharacter.agreeableness_score, impacts.agreeableness_score),
          neuroticism_score: applyImpact(updatedCharacter.neuroticism_score, impacts.neuroticism_score),
        };
        
        console.log("Applied impacts:", impacts);
        console.log("Updated character scores:", updatedCharacter);
      }
    }

    if (updatedCharacter && !isEnding) {
      const deathCheck = checkForDeath(
        nextAge, 
        updatedCharacter.heath_score
      );

      if (deathCheck.isDead) {
        // generate a death ending chapter.
        const llm = new ChatOpenAI({
          apiKey: token,
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          temperature: 0.8,
          configuration: { baseURL: "https://api.deepinfra.com/v1/openai" },
        });

        const deathEndingPrompt = `Write the final chapter (sudden death ending) of this person's life story.

        Character: ${updatedCharacter.name} (${updatedCharacter.gender})
        Age at Death: ${nextAge}
        
        Character's Final State:
        Main Attributes - Health: ${updatedCharacter.heath_score}/100, Family: ${updatedCharacter.family_score}/100, Friend: ${updatedCharacter.friend_score}/100, Career: ${updatedCharacter.career_score}/100, Wealth: ${updatedCharacter.wealth_score}/100
        Personality Traits - Openness: ${updatedCharacter.openness_score}/100, Conscientiousness: ${updatedCharacter.conscientiousness_score}/100, Extraversion: ${updatedCharacter.extraversion_score}/100, Agreeableness: ${updatedCharacter.agreeableness_score}/100, Neuroticism: ${updatedCharacter.neuroticism_score}/100
        ${updatedCharacter.relationship && updatedCharacter.relationship.length > 0 ? `Relationships: ${updatedCharacter.relationship.map(r => r.name).join(", ")}` : ""}
        ${updatedCharacter.hobbies && updatedCharacter.hobbies.length > 0 ? `Hobbies: ${updatedCharacter.hobbies.join(", ")}` : ""}
        
        Previous chapter: "${previousChapter.text}"
        Last decision: "${decision.choiceText}"
        
        Context: The character has unexpectedly died at age ${nextAge}${updatedCharacter.heath_score < 40 ? " due to health complications" : ""}. The character's death is sudden and unexpected.

        Requirements:
        - Use second person ("You...")
        - One paragraph, 120-180 words
        - Realistic, grounded, emotionally restrained — not poetic or abstract
        - Describe the circumstances of death naturally (accident, illness, natural causes based on age/health)
        - Reflect on the character's life's journey, what the character accomplished, relationships they had
        - Consider the character's attribute scores to reflect on the character's life
        - Show the impact of the character's death on loved ones
        - No flowery metaphors or cosmic language
        - Make it feel like an honest, bittersweet conclusion

        Output only the narrative text, no choices.`;

        const deathResponse = await llm.invoke([
          new SystemMessage("You are a creative story generator."),
          new HumanMessage(deathEndingPrompt),
        ]);

        const deathText =
          typeof deathResponse.content === "string"
            ? deathResponse.content
            : deathResponse.content
                .map((p: unknown) =>
                  typeof p === "object" && p !== null && "text" in p
                    ? (p as { text: string }).text
                    : ""
                )
                .join("")
                .trim();

        const deathChapter: Chapter = {
          id: `ending_death_${nextAge}`,
          text: deathText,
          age: nextAge,
          motifs: ["Loss", "Mortality", "Legacy"],
          chapterNumber: chapterNumber,
          totalChapters: totalChapters,
          choices: [],
        };

        return NextResponse.json({ 
          chapter: deathChapter, 
          character: updatedCharacter,
          isDeath: true
        }, { status: 200 });
      }
    }
    
    
    

    const characterContext = updatedCharacter
      ? `Character: ${updatedCharacter.name} (${updatedCharacter.gender})
         Main Attributes - Health: ${updatedCharacter.heath_score}/100, Family: ${updatedCharacter.family_score}/100, Friend: ${updatedCharacter.friend_score}/100, Career: ${updatedCharacter.career_score}/100, Wealth: ${updatedCharacter.wealth_score}/100
         Personality Traits - Openness: ${updatedCharacter.openness_score}/100, Conscientiousness: ${updatedCharacter.conscientiousness_score}/100, Extraversion: ${updatedCharacter.extraversion_score}/100, Agreeableness: ${updatedCharacter.agreeableness_score}/100, Neuroticism: ${updatedCharacter.neuroticism_score}/100
         ${updatedCharacter.hobbies && updatedCharacter.hobbies.length > 0 ? `Hobbies: ${updatedCharacter.hobbies.join(", ")}` : ""}
         ${updatedCharacter.relationship && updatedCharacter.relationship.length > 0 ? `Family: ${updatedCharacter.relationship.map(r => `${r.name} (${r.relationship_type})`).join(", ")}` : ""}`
      : "";
    const currentYear = (settings?.world?.yearStart ?? 0) + Number(previousChapter.age);
    const untakenChoices = decision.untakenChoices;
  
    console.log(`Progress: Chapter ${chapterNumber}/${totalChapters} (${chaptersRemaining} remaining)`);
    console.log(`Approaching end: ${isApproachingEnd}, Is ending: ${isEnding}`);

    // Select motifs for this chapter
    const motifs = selectMotifsForChapter(nextAge);
    console.log(`Chapter ${nextChapterId} motifs:`, motifs);

    // Build story context based on chapter position
    let narrativeContext = "";
    if (isApproachingEnd) {
      if (chaptersRemaining === 2) {
        narrativeContext = `
        IMPORTANT NARRATIVE CONTEXT:
        - This is the second-to-last chapter before the ending (${chaptersRemaining} chapters remaining)
        - Begin introducing elements of closure and reflection
        - Start tying up loose ends in the character's life
        - The next chapter will be the final one before the ending
        - Hint at life's culmination without fully resolving everything yet`;
          } else if (chaptersRemaining === 1) {
            narrativeContext = `
        IMPORTANT NARRATIVE CONTEXT:
        - This is the FINAL chapter before the ending (last chapter with choices)
        - Build toward a sense of completion and finality
        - Major life events should reach their climax
        - Set up the ending chapter which will provide closure
        - The character's journey is reaching its conclusion`;
          }
    } 
    else if (chapterNumber === Math.floor(totalChapters / 2)) {
        narrativeContext = `
      IMPORTANT NARRATIVE CONTEXT:
      - This is the midpoint of the story (Chapter ${chapterNumber}/${totalChapters})
      - This is a pivotal turning point in the character's life
      - Major shifts in direction or perspective can happen here`;
    }

    const storyPrompt = `Continue the story of this person's life.
    - Current Year: ${currentYear}
    ${characterContext}

    Story Progress: Chapter ${chapterNumber} of ${totalChapters} (${chaptersRemaining} chapters remaining until ending)
    ${narrativeContext}

    Thematic Focus (Motifs): ${motifs.join(", ")}
    - Must weave these themes into the narrative direction and emotional tone
    
    Previous chapter (age ${previousChapter.age}): "${previousChapter.text}"
    ${decision.choiceText !== "Next" ? `Player's choice: "${decision.choiceText}"` : ""}
    ${untakenChoices.length > 0 ? `Untaken choices: ${untakenChoices.map((c) => `"${c.text}"`).join(", ")}` : ""}
    The character is now age ${nextAge}. 
    The chapter must match the time skip between the previous chapter and this chapter.
    The chapter must be specific, realistic, grounded and detailed.
    If one of the character scores is below 40, the chapter must be about that attribute and the character's life but do not mention the score in the chapter.
    Introduce new relationships and interactions with the people to shape the character's life such as family, friends, acquaintances, significant others, etc.
    The relationship must match the character's age and context.
    Describe the decision and the consequences of the taken decision and the untaken choices.

    Requirements:
    - Use second person ("You...")
    - One paragraph, around 120 words.
    - Stay realistic and grounded
    - Let the motifs inform the story's focus and emotional weight

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

    // Extract relationships, hobbies, and attribute/trait changes from the story
    if (updatedCharacter) {
      const extractionPrompt = `Analyze this story chapter and extract character development information:

      Story: "${storyText}"
      
      Current character age: ${nextAge}
      Current state:
      - Health: ${updatedCharacter.heath_score}/100
      - Family: ${updatedCharacter.family_score}/100
      - Friend: ${updatedCharacter.friend_score}/100
      - Career: ${updatedCharacter.career_score}/100
      - Wealth: ${updatedCharacter.wealth_score}/100
      - Openness: ${updatedCharacter.openness_score}/100
      - Conscientiousness: ${updatedCharacter.conscientiousness_score}/100
      - Extraversion: ${updatedCharacter.extraversion_score}/100
      - Agreeableness: ${updatedCharacter.agreeableness_score}/100
      - Neuroticism: ${updatedCharacter.neuroticism_score}/100
      
      Extract:
      1. NEW RELATIONSHIPS: People the character meets or develops meaningful relationships with
         - Only include if there's a SPECIFIC NAME mentioned
         - Format: "Name (Type)" where Type is one of: Friend, Best Friend, Partner, Spouse, Colleague, Mentor, Sibling, Child
         - Example: "Emma (Friend)", "John Smith (Colleague)", "Sarah (Partner)"
      
      2. NEW HOBBIES: Activities the character regularly does or develops interest in
         - Be specific (e.g., "Guitar", "Basketball", "Reading", "Cooking")
         - Only ongoing activities, not one-time events
      
      3. ATTRIBUTE IMPACTS: How the story events should affect main attributes (based on story context)
         - Positive events increase scores, negative events decrease them
         - Use small adjustments: -10 to +10
         - Consider: health issues/improvements, family events, social activities, career progress, financial changes
      
      4. TRAIT IMPACTS: How the story reveals or develops personality traits
         - Use small adjustments: -5 to +5
         - Openness: creativity, new experiences, adaptability
         - Conscientiousness: responsibility, organization, discipline
         - Extraversion: social energy, assertiveness
         - Agreeableness: cooperation, empathy, kindness
         - Neuroticism: stress, anxiety, emotional instability
      
      Return ONLY a JSON object in this exact format:
      {
        "relationships": ["Emma (Friend)", "Michael (Colleague)"],
        "hobbies": ["Piano", "Hiking"],
        "attribute_impacts": {
          "heath_score": 0,
          "family_score": 5,
          "friend_score": 10,
          "career_score": 0,
          "wealth_score": 0
        },
        "trait_impacts": {
          "openness_score": 3,
          "conscientiousness_score": 0,
          "extraversion_score": 5,
          "agreeableness_score": 2,
          "neuroticism_score": -3
        }
      }
      
      If nothing is found, use empty arrays or 0 for all impacts.
      No other text, just the JSON object.`;

      console.log("Extraction prompt:", extractionPrompt);

      const extractionResponse = await llm.invoke([
        new SystemMessage("You are a precise data extraction assistant. Always return ONLY valid JSON."),
        new HumanMessage(extractionPrompt),
      ]);

      const extractionText =
        typeof extractionResponse.content === "string"
          ? extractionResponse.content
          : extractionResponse.content
              .map((p: unknown) =>
                typeof p === "object" && p !== null && "text" in p
                  ? (p as { text: string }).text
                  : ""
              )
              .join("")
              .trim();

      console.log("Extraction response:", extractionText);

      try {
        const jsonMatch = extractionText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : extractionText;
        const extractedData = JSON.parse(jsonText) as {
          relationships?: string[];
          hobbies?: string[] | string;
          attribute_impacts?: Partial<ChoiceImpacts>;
          trait_impacts?: Partial<ChoiceImpacts>;
        };

        console.log("Parsed extraction data:", {
          relationships: extractedData.relationships,
          hobbies: extractedData.hobbies,
          hobbiesType: typeof extractedData.hobbies,
          hobbiesIsArray: Array.isArray(extractedData.hobbies)
        });

        // Add new relationships in "Name (Type)" format with improved duplicate detection
        if (extractedData.relationships && extractedData.relationships.length > 0) {
          // normalize name for comparison (trim, lowercase, collapse spaces)
          const normalizeName = (name: string): string => {
            return name.trim().toLowerCase().replace(/\s+/g, ' ');
          };
          
          // normalize relationship type for comparison
          const normalizeType = (type: string): string => {
            return type.trim().toLowerCase().replace(/\s+/g, '_');
          };
          
          // create a set of existing relationships for fast lookup
          // key format: "normalized_name|normalized_type"
          const existingRels = new Set(
            updatedCharacter.relationship.map(r => 
              `${normalizeName(r.name)}|${normalizeType(r.relationship_type)}`
            )
          );
          
          // also track names alone to avoid adding same person with different type
          const existingNames = new Set(
            updatedCharacter.relationship.map(r => normalizeName(r.name))
          );
          
          const newRelationships = extractedData.relationships
            .map(relString => {
              const match = relString.match(/^(.+?)\s*\((.+?)\)$/);
              if (!match) return null;
              
              const rawName = match[1].trim();
              const rawType = match[2].trim();
              const normalizedName = normalizeName(rawName);
              const normalizedType = normalizeType(rawType);
              
              const relKey = `${normalizedName}|${normalizedType}`;
              if (existingRels.has(relKey)) {
                return null; 
              }
              
              if (existingNames.has(normalizedName)) {
                console.log(`Note: ${rawName} already exists with different relationship type`);
              }
              
              let estimatedAge = nextAge;
              if (normalizedType === 'child') {
                estimatedAge = Math.max(0, nextAge - 25);
              } else if (normalizedType === 'mentor') {
                estimatedAge = nextAge + 15;
              } else {
                estimatedAge = nextAge + Math.floor(Math.random() * 10 - 5);
              }
              
              return {
                name: rawName, 
                relationship_type: normalizedType,
                age: Math.max(0, estimatedAge)
              };
            })
            .filter((rel): rel is { name: string; relationship_type: string; age: number } => rel !== null);

          if (newRelationships.length > 0) {
            updatedCharacter.relationship = [...updatedCharacter.relationship, ...newRelationships];
            console.log("Added new relationships:", newRelationships);
          }
        }

        if (extractedData.hobbies) {
          let hobbyList: string[] = [];
          if (Array.isArray(extractedData.hobbies)) {
            hobbyList = extractedData.hobbies;
          } else if (typeof extractedData.hobbies === 'string') {
            hobbyList = extractedData.hobbies.split(/[,\n]/).map(h => h.trim()).filter(h => h.length > 0);
          }

          if (hobbyList.length > 0) {
            const normalizeHobby = (hobby: string): string => {
              return hobby.trim().toLowerCase().replace(/\s+/g, ' ');
            };
            
            const existingHobbies = new Set(
              updatedCharacter.hobbies.map(h => normalizeHobby(h))
            );
            
            const newHobbies = hobbyList
              .map(hobby => hobby.trim())
              .filter(hobby => {
                if (hobby.length === 0) return false;
                const normalized = normalizeHobby(hobby);
                if (existingHobbies.has(normalized)) {
                  return false; 
                }
                existingHobbies.add(normalized); 
                return true;
              });

            if (newHobbies.length > 0) {
              updatedCharacter.hobbies = [...updatedCharacter.hobbies, ...newHobbies];
              console.log("Added new hobbies:", newHobbies);
            } else {
              console.log("No new hobbies to add (all duplicates or empty)");
            }
          }
        }

        // Apply attribute impacts from story context
        if (extractedData.attribute_impacts) {
          const impacts = extractedData.attribute_impacts;
          if (impacts.heath_score) {
            updatedCharacter.heath_score = Math.max(0, Math.min(100, 
              updatedCharacter.heath_score + impacts.heath_score
            ));
          }
          if (impacts.family_score) {
            updatedCharacter.family_score = Math.max(0, Math.min(100, 
              updatedCharacter.family_score + impacts.family_score
            ));
          }
          if (impacts.friend_score) {
            updatedCharacter.friend_score = Math.max(0, Math.min(100, 
              updatedCharacter.friend_score + impacts.friend_score
            ));
          }
          if (impacts.career_score) {
            updatedCharacter.career_score = Math.max(0, Math.min(100, 
              updatedCharacter.career_score + impacts.career_score
            ));
          }
          if (impacts.wealth_score) {
            updatedCharacter.wealth_score = Math.max(0, Math.min(100, 
              updatedCharacter.wealth_score + impacts.wealth_score
            ));
          }
          console.log("Applied attribute impacts:", impacts);
        }

        // Apply trait impacts from story context
        if (extractedData.trait_impacts) {
          const impacts = extractedData.trait_impacts;
          if (impacts.openness_score) {
            updatedCharacter.openness_score = Math.max(0, Math.min(100, 
              updatedCharacter.openness_score + impacts.openness_score
            ));
          }
          if (impacts.conscientiousness_score) {
            updatedCharacter.conscientiousness_score = Math.max(0, Math.min(100, 
              updatedCharacter.conscientiousness_score + impacts.conscientiousness_score
            ));
          }
          if (impacts.extraversion_score) {
            updatedCharacter.extraversion_score = Math.max(0, Math.min(100, 
              updatedCharacter.extraversion_score + impacts.extraversion_score
            ));
          }
          if (impacts.agreeableness_score) {
            updatedCharacter.agreeableness_score = Math.max(0, Math.min(100, 
              updatedCharacter.agreeableness_score + impacts.agreeableness_score
            ));
          }
          if (impacts.neuroticism_score) {
            updatedCharacter.neuroticism_score = Math.max(0, Math.min(100, 
              updatedCharacter.neuroticism_score + impacts.neuroticism_score
            ));
          }
          console.log("Applied trait impacts:", impacts);
        }
      } catch (parseError) {
        console.error("Failed to parse extraction data:", parseError);
        console.error("Raw extraction text:", extractionText);
        // Continue without adding relationships/hobbies/impacts
      }
    }

    const choicesPrompt = `Based on this story chapter, generate exactly 3 meaningful choices for the character's age and context:

    "${storyText}"

    Character's Current State:
    Main Attributes - Health: ${updatedCharacter?.heath_score || 50}/100, Family: ${updatedCharacter?.family_score || 50}/100, Friend: ${updatedCharacter?.friend_score || 50}/100, Career: ${updatedCharacter?.career_score || 50}/100, Wealth: ${updatedCharacter?.wealth_score || 50}/100
    Personality Traits - Openness: ${updatedCharacter?.openness_score || 50}/100, Conscientiousness: ${updatedCharacter?.conscientiousness_score || 50}/100, Extraversion: ${updatedCharacter?.extraversion_score || 50}/100, Agreeableness: ${updatedCharacter?.agreeableness_score || 50}/100, Neuroticism: ${updatedCharacter?.neuroticism_score || 50}/100

    Story Progress: Chapter ${chapterNumber}/${totalChapters} (${chaptersRemaining} remaining)
    ${isApproachingEnd ? `
    CRITICAL: This is near the end of the story (${chaptersRemaining} chapters left).
    - Choices should reflect life's culminating moments
    - Make choices feel significant and impactful for the character's final chapters
    ${chaptersRemaining === 1 ? "- These are the FINAL choices before the ending - make them deeply meaningful" : ""}
    ` : ""}

    IMPORTANT:
    Thematic Focus (Motifs): ${motifs.join(", ")}
    - Must weave these themes into the narrative direction and emotional tone

    Requirements:
    - Use second person ("You...")
    - Choice must be specific, realistic, grounded and detailed.
    - Each choice must be different and prospose a distinct path for the character's life.
    - Each choice MUST have clear trade-offs between different attributes and personality traits
    - Each choice should improve some attributes while potentially decreasing others
    - Consider how choices impact: Health, Family, Friend, Career, Wealth
    - Consider how choices reflect and develop: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
    - If one of the character scores is below 40, the choice must be about that attribute and the character's life.
    - Examples of trade-offs:
      * Focusing on career might increase Career/Wealth but decrease Family/Friend
      * Taking risks might increase Openness/Extraversion but decrease Conscientiousness
      * Helping others might increase Agreeableness/Friend but decrease Career/Wealth
      * Avoiding conflict might decrease Neuroticism but also decrease Extraversion
    - Choices should have realistic consequences and emotional weight
    - Choices should have potential long-term consequences whether positive or negative
    - Keep choice text short (10-20 words max)
    - Make them realistic and grounded in the context of the story
    - Actions must be realistic with the character's age and context
    - Actions must match a commonsense approach to the character's age and context
    - Generate EXACTLY 3 choices (preferred) with clear trade-offs between them
    - Return ONLY a JSON array with impact scores in this format:
    [
      {
        "text": "Choice 1 text",
        "impacts": {
          "heath_score": 0,
          "family_score": 5,
          "friend_score": -10,
          "career_score": 15,
          "wealth_score": 10,
          "openness_score": 5,
          "conscientiousness_score": 10,
          "extraversion_score": 0,
          "agreeableness_score": -5,
          "neuroticism_score": -3
        }
      },
      {
        "text": "Choice 2 text",
        "impacts": {
          "heath_score": 5,
          "family_score": 10,
          "friend_score": 5,
          "career_score": -15,
          "wealth_score": -10,
          "openness_score": -5,
          "conscientiousness_score": 5,
          "extraversion_score": 10,
          "agreeableness_score": 15,
          "neuroticism_score": 5
        }
      },
      {
        "text": "Choice 3 text",
        "impacts": {
          "heath_score": -5,
          "family_score": 0,
          "friend_score": 10,
          "career_score": 5,
          "wealth_score": -5,
          "openness_score": 15,
          "conscientiousness_score": -10,
          "extraversion_score": 8,
          "agreeableness_score": 5,
          "neuroticism_score": -8
        }
      }
    ]
    
    Impact Score Guidelines:
    - Use integers between -20 and +20 for each attribute/trait
    - Positive numbers increase the score, negative numbers decrease it
    - Each choice should have a mix of positive and negative impacts (trade-offs)
    - Total impacts across all attributes should roughly balance out
    - Consider realistic consequences: career focus reduces family time, helping others increases agreeableness but may cost wealth
    - Set impacts to 0 if the choice doesn't significantly affect that attribute
    
    No other text, just the JSON array.`;
    console.log(choicesPrompt);

    const choicesResponse = await llm.invoke([
      new SystemMessage(
        "You are a creative story generator. Always return ONLY valid JSON arrays."
      ),
      new HumanMessage(choicesPrompt),
    ]);
    console.log(choicesResponse);
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
    let choicesData: { text: string; impacts?: ChoiceImpacts }[] = [];
    try {
      const jsonMatch = choicesText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : choicesText;
      choicesData = JSON.parse(jsonText);
    } catch (parseError) {
      choicesData = [
        { text: "Continue forward", impacts: {} },
        { text: "Take a different path", impacts: {} },
        { text: "Reflect on the past", impacts: {} },
      ];
    }

    if (isEnding) {
      const endingMotifs = selectMotifsForChapter(nextAge);
      
      const endingPrompt = `Write the final chapter (ending) of this person's life story.

      Character: ${updatedCharacter?.name} (${updatedCharacter?.gender})
      Final Age: ${nextAge}
      
      Character's Final State:
      Main Attributes - Health: ${updatedCharacter?.heath_score || 50}/100, Family: ${updatedCharacter?.family_score || 50}/100, Friend: ${updatedCharacter?.friend_score || 50}/100, Career: ${updatedCharacter?.career_score || 50}/100, Wealth: ${updatedCharacter?.wealth_score || 50}/100
      Personality Traits - Openness: ${updatedCharacter?.openness_score || 50}/100, Conscientiousness: ${updatedCharacter?.conscientiousness_score || 50}/100, Extraversion: ${updatedCharacter?.extraversion_score || 50}/100, Agreeableness: ${updatedCharacter?.agreeableness_score || 50}/100, Neuroticism: ${updatedCharacter?.neuroticism_score || 50}/100
      ${updatedCharacter?.relationship && updatedCharacter.relationship.length > 0 ? `Relationships: ${updatedCharacter.relationship.map(r => r.name).join(", ")}` : ""}
      ${updatedCharacter?.hobbies && updatedCharacter.hobbies.length > 0 ? `Hobbies: ${updatedCharacter.hobbies.join(", ")}` : ""}
      
      Previous chapter: "${previousChapter.text}"
      Last decision: "${decision.choiceText}"

      This is the final chapter after ${totalChapters} chapters of their life journey.

      Thematic Focus (Motifs): ${endingMotifs.join(", ")}
      - Must weave these themes into the narrative direction and emotional tone

      Requirements:
      - Use second person ("You...")
      - One paragraph, 120-180 words
      - Realistic, grounded, emotionally restrained — not poetic or abstract
      - Show the culmination of their life journey
      - Reflect on how their choices shaped who they became
      - Reference their relationships, achievements, and struggles
      - Consider their final attribute scores - reflect high/low values naturally
      - End with a sense of closure and peace (or appropriate emotion based on their life)
      - No flowery metaphors or cosmic language
      - Make it feel like a fitting conclusion to their unique story

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
        motifs: endingMotifs,
        chapterNumber: chapterNumber,
        totalChapters: totalChapters,
        choices: [],
      };

      return NextResponse.json({ 
        chapter: endingChapter, 
        character: updatedCharacter 
      }, { status: 200 });
    }

    const choices = choicesData.slice(0, 3).map((choice, index) => {
      const nextId = `chapter_${chapterNumber + index + 1}`;
      return {
        id: `choice_${index + 1}`,
        text: choice.text,
        next: nextId,
        impacts: choice.impacts,
      };
    });

    const chapter: Chapter = {
      id: nextChapterId,
      text: storyText,
      age: nextAge,
      motifs: motifs,
      chapterNumber: chapterNumber,
      totalChapters: totalChapters,
      choices,
    };

    return NextResponse.json({ 
      chapter, 
      character: updatedCharacter 
    }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate chapter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

