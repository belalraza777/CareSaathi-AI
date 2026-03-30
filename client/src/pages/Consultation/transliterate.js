
import Sanscript from "sanscript";

// Convert Devanagari → Latin with cleanup for readable phonetic output
export const toEnglishLetters = (text) => {
  try {
    // Use HK (Harvard-Kyoto) scheme for cleaner output, then normalize
    let result = Sanscript.t(text, "devanagari", "hk");
    // Lowercase for consistent output
    result = result.toLowerCase();
    // Normalize spacing and remove extra marks
    result = result.replace(/\s+/g, " ").trim();
    return result;
  } catch (err) {
    console.error("Transliteration error:", err);
    return text; // Fallback to original if conversion fails
  }
};