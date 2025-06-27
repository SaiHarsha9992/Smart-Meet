import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const prompt = `
Extract only technical skills from the following resume text.
Return your response as a clean JSON array of strings like ["JavaScript", "Node.js", "React"].
Avoid explanation, just give the array.

Resume:
${text}
    `;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await geminiResponse.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Safely extract JSON array using RegEx
    const match = rawText.match(/\[.*?\]/s);
    const skills = match ? JSON.parse(match[0]) : [];

    return NextResponse.json({ skills });
  } catch (err) {
    console.error("Gemini PDF API error:", err);
    return NextResponse.json({ error: "Failed to process resume" }, { status: 500 });
  }
}
