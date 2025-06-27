import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    // === Prompt to extract skills ===
    const skillsPrompt = `
Extract only technical skills from the following resume text.
Return your response as a clean JSON array of strings like ["JavaScript", "Node.js", "React"].
Avoid explanation, just give the array.

Resume:
${text}
    `;

    const skillsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: skillsPrompt }] }],
        }),
      }
    );

    const skillsData = await skillsRes.json();
    const skillsText =
      skillsData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const skillMatch = skillsText.match(/\[.*?\]/s);
    const skills = skillMatch ? JSON.parse(skillMatch[0]) : [];

    // === Prompt to get ATS score ===
    const atsPrompt = `
Rate this resume text for ATS (Applicant Tracking System) friendliness out of 100.
Give a JSON like: { "score": 85, "reason": "Well-structured with clear sections and keywords." }

Resume:
${text}
    `;

    const atsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: atsPrompt }] }],
        }),
      }
    );

    const atsData = await atsRes.json();
    const atsText = atsData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    const atsMatch = atsText.match(/\{.*\}/s);
    const ats = atsMatch ? JSON.parse(atsMatch[0]) : { score: 0, reason: "Could not evaluate." };

    return NextResponse.json({ skills, ats });
  } catch (err) {
    console.error("Gemini PDF API error:", err);
    return NextResponse.json({ error: "Failed to process resume" }, { status: 500 });
  }
}
