export async function askGemini(prompt) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  // Your route always returns `questions: [...]`
  if (data?.questions?.length > 0) {
    return data.questions[0];
  }

  return "Sorry, I couldn't understand the response.";
}
