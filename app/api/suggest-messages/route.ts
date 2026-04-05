const SUGGESTION_PROMPT_TEMPLATE =
  "Create exactly {{count}} complete and engaging feedback prompts for an anonymous social messaging platform. Focus on topic '{{topic}}' and use a '{{tone}}' tone. Each prompt must be a full sentence, 8 to 20 words, and safe for a diverse audience. Return ONLY one plain text string where each prompt is separated by '||' with no numbering, no bullets, and no extra commentary.";

function buildPrompt(topic: string, tone: string, count: number): string {
  return SUGGESTION_PROMPT_TEMPLATE.replace("{{topic}}", topic)
    .replace("{{tone}}", tone)
    .replace("{{count}}", String(count));
}

function parseSuggestions(rawText: string): string[] {
  const cleanedText = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const fromDelimiters = cleanedText
    .split("||")
    .map((item) => item.trim())
    .filter(Boolean);

  if (fromDelimiters.length > 0) {
    return fromDelimiters;
  }

  return cleanedText
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter((line) => line.length > 0);
}

function normalizeSuggestion(text: string): string {
  const normalized = text
    .replace(/^[-*\d.)\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  if (/[.!?]$/.test(normalized)) {
    return normalized;
  }

  return `${normalized}.`;
}

function buildFallbackSuggestions(topic: string, count: number): string[] {
  const safeTopic = topic.trim() || "personal growth";
  const templates = [
    `What is one thing you think I am doing well around ${safeTopic}, and why?`,
    `What is one practical improvement you would suggest for how I handle ${safeTopic}?`,
    `Can you share a recent example that shaped your opinion about my ${safeTopic} approach?`,
    `What small habit related to ${safeTopic} would make the biggest positive difference for me?`,
    `If you were mentoring me on ${safeTopic}, what would you ask me to focus on next?`,
  ];

  return templates.slice(0, Math.min(Math.max(count, 3), 5));
}

function ensureSuggestionCount(
  rawSuggestions: string[],
  topic: string,
  count: number,
): string[] {
  const normalized = rawSuggestions
    .map(normalizeSuggestion)
    .filter((item) => item.length >= 18);

  const unique: string[] = [];
  for (const item of normalized) {
    if (
      !unique.some((existing) => existing.toLowerCase() === item.toLowerCase())
    ) {
      unique.push(item);
    }
  }

  if (unique.length >= count) {
    return unique.slice(0, count);
  }

  const fallback = buildFallbackSuggestions(topic, count);
  for (const item of fallback) {
    if (
      !unique.some((existing) => existing.toLowerCase() === item.toLowerCase())
    ) {
      unique.push(item);
    }

    if (unique.length >= count) {
      break;
    }
  }

  return unique.slice(0, count);
}

const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
];

export async function POST(request: Request) {
  try {
    const {
      topic = "general",
      tone = "friendly",
      count = 5,
    } = await request.json();
    const requestedCount = Number(count);
    const safeCount = Number.isFinite(requestedCount)
      ? Math.min(Math.max(requestedCount, 3), 5)
      : 5;
    const safeTopic = String(topic).trim().slice(0, 120) || "general";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          success: true,
          message: "Suggestions generated from fallback prompts",
          suggestions: buildFallbackSuggestions(safeTopic, safeCount),
        },
        { status: 200 },
      );
    }

    const prompt = buildPrompt(safeTopic, String(tone), safeCount);

    let data: any = null;
    let lastErrorText = "";

    for (const model of GEMINI_MODEL_CANDIDATES) {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 300,
              responseMimeType: "text/plain",
            },
          }),
        },
      );

      if (geminiResponse.ok) {
        data = await geminiResponse.json();
        break;
      }

      lastErrorText = await geminiResponse.text();
    }

    if (!data) {
      const fallbackSuggestions = buildFallbackSuggestions(
        safeTopic,
        safeCount,
      );
      return Response.json(
        {
          success: true,
          message: "Suggestions generated from fallback prompts",
          suggestions: fallbackSuggestions,
          error:
            lastErrorText ||
            "No compatible Gemini model found for this API key",
        },
        { status: 200 },
      );
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

    const suggestions = ensureSuggestionCount(
      parseSuggestions(rawText),
      safeTopic,
      safeCount,
    );

    if (suggestions.length < 3) {
      const fallbackSuggestions = buildFallbackSuggestions(
        safeTopic,
        safeCount,
      );
      return Response.json(
        {
          success: true,
          message: "Suggestions generated from fallback prompts",
          suggestions: fallbackSuggestions,
        },
        { status: 200 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Suggestions generated successfully",
        suggestions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating suggestions", error);
    const fallbackSuggestions = buildFallbackSuggestions("general", 5);
    return Response.json(
      {
        success: true,
        message: "Suggestions generated from fallback prompts",
        suggestions: fallbackSuggestions,
      },
      { status: 200 },
    );
  }
}
