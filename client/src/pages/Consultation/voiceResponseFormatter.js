
export const formatAiResponseForTts = (responseText) => {
  const raw = String(responseText || "").trim();
  if (!raw) {
    return "";
  }

  // Normalize markdown/list-heavy output into speech-friendly plain sentences.
  const flattened = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""))
    .join(". ");

  let clean = flattened
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[•]/g, " ")
    .replace(/[–—]/g, " to ")
    .replace(/>\s*([\d.]+)\s*°?\s*C/gi, "greater than $1 degrees Celsius")
    .replace(/>\s*([\d.]+)\s*°?\s*F/gi, "greater than $1 degrees Fahrenheit")
    .replace(/\s+/g, " ")
    .trim();

  const sentences = clean.match(/[^.!?]+[.!?]?/g) || [clean];
  clean = sentences
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return clean;
};
