const SUGGESTION_PROMPT_TEMPLATE = `You are an assistant that creates short anonymous message ideas for a public profile inbox.

Rules:
- Generate exactly {{count}} suggestions.
- Each suggestion must be a single sentence.
- Keep each suggestion friendly, respectful, and under 120 characters.
- Avoid hate, harassment, sexual content, and personal data requests.
- Do not number the suggestions.
- Output strictly as a JSON array of strings.

Context:
- Topic: {{topic}}
- Tone: {{tone}}
`;

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

  const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  };

  try {
    const parsed = JSON.parse(cleanedText);
    const directArray = toStringArray(parsed);
    if (directArray.length > 0) {
      return directArray;
    }

    if (parsed && typeof parsed === "object") {
      const fromSuggestions = toStringArray(
        (parsed as { suggestions?: unknown }).suggestions,
      );
      if (fromSuggestions.length > 0) {
        return fromSuggestions;
      }
    }
  } catch {
    // Fall back to line parsing if model did not return strict JSON.
  }

  const firstBracket = cleanedText.indexOf("[");
  const lastBracket = cleanedText.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const bracketArray = JSON.parse(
        cleanedText.slice(firstBracket, lastBracket + 1),
      );
      const extracted = toStringArray(bracketArray);
      if (extracted.length > 0) {
        return extracted;
      }
    } catch {
      // Ignore and use text fallback.
    }
  }

  return cleanedText
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(
      (line) => line !== "[" && line !== "]" && line !== "," && line.length > 0,
    )
    .map((line) => line.replace(/^"|",?$/g, "").trim())
    .filter(Boolean);
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
      ? Math.min(Math.max(requestedCount, 3), 10)
      : 5;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          success: false,
          message: "Missing GEMINI_API_KEY in environment variables",
        },
        { status: 500 },
      );
    }

    const prompt = buildPrompt(String(topic), String(tone), safeCount);

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
              responseMimeType: "application/json",
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
      return Response.json(
        {
          success: false,
          message: "Failed to generate suggestions",
          error:
            lastErrorText ||
            "No compatible Gemini model found for this API key",
        },
        { status: 502 },
      );
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

    const suggestions = parseSuggestions(rawText).slice(0, safeCount);

    if (suggestions.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Model returned empty suggestions",
        },
        { status: 500 },
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
    return Response.json(
      {
        success: false,
        message: "Error generating suggestions",
      },
      { status: 500 },
    );
  }
}
