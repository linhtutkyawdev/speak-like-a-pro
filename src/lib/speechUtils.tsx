const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/[^a-z0-9\s]/g, "") // Remove all non-alphanumeric characters except spaces
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim(); // Trim leading/trailing spaces
};

export const cleanAndSplitText = (text: string): string[] => {
  return normalizeText(text).split(" ").filter(Boolean);
};

// Simple word similarity check (e.g., for "bound" vs "bond")
const areWordsSimilar = (
  word1: string,
  word2: string,
  tolerance: number = 1
): boolean => {
  if (word1 === word2) return true;
  if (Math.abs(word1.length - word2.length) > tolerance) return false;

  let mismatches = 0;
  const minLength = Math.min(word1.length, word2.length);
  for (let i = 0; i < minLength; i++) {
    if (word1[i] !== word2[i]) {
      mismatches++;
    }
  }
  // Add difference in length to mismatches
  mismatches += Math.abs(word1.length - word2.length);

  return mismatches <= tolerance;
};

export const compareTranscriptToPhrase = (
  phraseText: string,
  transcript: string
): JSX.Element[] => {
  const phraseWordsWithPunctuation = phraseText
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const cleanedPhraseWords = cleanAndSplitText(phraseText);
  const transcriptWords = cleanAndSplitText(transcript);

  const result: JSX.Element[] = [];
  const comparisonLength = Math.min(
    cleanedPhraseWords.length,
    transcriptWords.length
  );

  for (let i = 0; i < phraseWordsWithPunctuation.length; i++) {
    const originalPhraseWord = phraseWordsWithPunctuation[i];

    if (i < comparisonLength) {
      const cleanedPhraseWord = cleanedPhraseWords[i];
      const transcriptWord = transcriptWords[i];

      if (areWordsSimilar(cleanedPhraseWord, transcriptWord)) {
        // Match
        result.push(
          <span key={i} className="text-green-600 mr-1">
            {originalPhraseWord}
          </span>
        );
      } else {
        // Mismatch
        result.push(
          <span key={i} className="text-red-600 mr-1">
            {originalPhraseWord}
          </span>
        );
      }
    } else {
      // Phrase word beyond transcript length or no corresponding transcript word
      // or transcript word beyond phrase length
      result.push(
        <span key={i} className="text-gray-800 mr-1">
          {originalPhraseWord}
        </span>
      );
    }
  }

  return result;
};

export const isMatch = (phraseText: string, transcript: string): boolean => {
  const cleanedPhraseWords = cleanAndSplitText(phraseText);
  const transcriptWords = cleanAndSplitText(transcript);

  if (cleanedPhraseWords.length !== transcriptWords.length) {
    return false;
  }

  for (let i = 0; i < cleanedPhraseWords.length; i++) {
    if (!areWordsSimilar(cleanedPhraseWords[i], transcriptWords[i])) {
      return false;
    }
  }

  return true;
};
