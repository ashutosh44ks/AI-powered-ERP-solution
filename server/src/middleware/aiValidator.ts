import { forbiddenWords } from "../lib/constants.js";

export const validatePrompt = (prompt: string | undefined) => {
  const result = {
    isValid: true,
    error: "",
  };

  // Check if prompt is empty
  if (!prompt || prompt.trim() === "") {
    result.isValid = false;
    result.error = "Prompt cannot be empty.";
    return result;
  }
  // Basic length check
  if (prompt.trim().length < 10) {
    result.isValid = false;
    result.error = "Prompt is too short.";
    return result;
  }

  // Check for forbidden words
  // Prevent SQL injection that could be used to manipulate the database
  let maliciousScore = 0,
    maxScorePossible = 0;
  forbiddenWords.forEach(({ word, weight }) => {
    if (prompt.includes(word)) {
      result.isValid = false;
      console.error(
        `Prompt contains forbidden word: ${word} (weight: ${weight})`
      );
      maliciousScore += weight;
    }
    maxScorePossible += weight;
  });

  if (maliciousScore > 0) {
    result.isValid = false;
    result.error = `Your prompt seems to contain potentially harmful content. Please rephrase it. Malicious score: ${maliciousScore}/${maxScorePossible}`;
  }
  return result;
};

export const validateGeneratedSQLQuery = (query: string) => {
  const result = {
    isValid: true,
    error: "",
  };

  // Check if query is empty
  if (!query || query.trim() === "") {
    result.isValid = false;
    result.error = "SQL query cannot be empty.";
    return result;
  }

  const forbiddenQueryKeywords = [
    "DROP",
    "DELETE",
    "TRUNCATE",
    "ALTER",
    "CREATE",
    "INSERT INTO",
    "UPDATE",
    "EXECUTE",
    "--",
    // ";",
    "1=1",
    "0=0",
  ];
  forbiddenQueryKeywords.forEach((keyword) => {
    if (query.toUpperCase().includes(keyword)) {
      result.isValid = false;
      console.error(`SQL query contains forbidden keyword: ${keyword}`);
    }
  });
  if (!result.isValid) {
    result.error = "The SQL query contains forbidden keywords or operations.";
  }
  return result;
};
