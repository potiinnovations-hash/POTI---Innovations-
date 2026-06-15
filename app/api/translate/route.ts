import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang = "English", sourceLang = "Georgian" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text to translate" }, { status: 400 });
    }

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Returning source text as fallback.");
      return NextResponse.json({ translatedText: text });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate the following ${sourceLang} text to ${targetLang}. Return ONLY the translated text, do not add any quotes, markdown formatting, explanations or conversational text. Text: "${text}"`,
    });

    const translatedText = response.text ? response.text.trim() : "";
    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Translation API error:", error);
    return NextResponse.json({ error: error.message || "Translation failed" }, { status: 500 });
  }
}
