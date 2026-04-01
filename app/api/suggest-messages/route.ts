const SUGGESTION_PROMPT_TEMPLATE =
  "Create exactly {{count}} open-ended and engaging questions for an anonymous social messaging platform. Focus on topic '{{topic}}' and use a '{{tone}}' tone. Avoid personal or sensitive topics and keep the questions suitable for a diverse audience. Return ONLY one plain text string where each question is separated by '||' with no numbering, no bullets, and no extra commentary. Example format: What's a hobby you've recently started? || If you could have dinner with any historical figure, who would it be? || What's a simple thing that makes you happy?";

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
