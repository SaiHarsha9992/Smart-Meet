export function speak(text) {
  if (typeof window === "undefined" || !text) return;

  const synth = window.speechSynthesis;
  synth.cancel(); // Clear previous speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  console.log("🔊 Speaking:", text); // ✅ Confirm it's being called

  synth.speak(utterance);
}
