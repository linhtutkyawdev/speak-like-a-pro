import { Mic, MicOff, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compareTranscriptToPhrase } from "@/lib/speechUtils";

interface SpeakingPracticeCardsProps {
  practiceMode: "phrases" | "sentences";
  currentContent: string;
  transcript: string;
  listening: boolean;
  showCongratulations: boolean;
  userClickedRecord: boolean;
  handlePlayContent: () => void;
  handleRecord: () => void;
  handleNextContent: () => void;
  handleResetPractice: () => void;
  handleGoBackOneStep: () => void; // New prop for going back one step
  isSoundPlaying: boolean;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
  selectedLanguage: string;
}

const SpeakingPracticeCards: React.FC<SpeakingPracticeCardsProps> = ({
  practiceMode,
  currentContent,
  transcript,
  listening,
  showCongratulations,
  userClickedRecord,
  handlePlayContent,
  handleRecord,
  handleNextContent,
  handleResetPractice,
  handleGoBackOneStep, // Destructure new prop
  isSoundPlaying,
  setSelectedLanguage,
  selectedLanguage,
}) => {
  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6">
          {/* Phrase Display Card */}
          <Card className="border-emerald-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 mb-2">
                Practice This{" "}
                {practiceMode === "phrases" ? "Phrase" : "Sentence"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                <p
                  className="text-xl text-gray-800 leading-relaxed mb-4 flex flex-wrap justify-center"
                  style={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                >
                  {compareTranscriptToPhrase(currentContent, transcript)}
                </p>

                {/* Display transcript in real-time while listening, or after listening stops */}
                {transcript && (
                  <p className="text-xl text-center text-gray-800 leading-relaxed mt-4">
                    Your attempt: {transcript}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center mb-0 sm:mb-6 space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={handlePlayContent}
                  disabled={isSoundPlaying} // Disable button while sound is playing
                  className="items-center space-x-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hidden sm:flex"
                >
                  <Play className="h-4 w-4" />
                  <span>
                    Listen to{" "}
                    {practiceMode === "phrases" ? "Phrase" : "Sentence"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setSelectedLanguage((prevLang) =>
                      prevLang === "en-US" ? "en-GB" : "en-US"
                    )
                  }
                  disabled={isSoundPlaying} // Disable button while sound is playing
                  className="items-center space-x-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hidden sm:flex"
                >
                  <span>
                    Switch to{" "}
                    {selectedLanguage === "en-US" ? "UK English" : "US English"}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recording Card */}
          <Card className="border-emerald-200">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-gray-900">
                Record Your Voice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {/* Recording Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleRecord}
                    size="lg"
                    disabled={isSoundPlaying} // Disable button while sound is playing
                    className={`w-24 h-24 rounded-full ${
                      listening
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    } text-white`}
                  >
                    {listening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                </div>

                {/* Recording Status */}
                <div className="text-center">
                  {
                    listening ? (
                      <div>
                        <p className="text-lg font-semibold text-red-600 mb-2">
                          Recording...
                        </p>
                        <p className="text-sm text-gray-600">
                          Speak the phrase clearly
                        </p>
                      </div>
                    ) : showCongratulations ? (
                      <div>
                        <p className="text-lg font-semibold text-green-600 mb-2">
                          Congratulations! You got it right!
                        </p>
                      </div>
                    ) : showCongratulations ? (
                      <div>
                        <p className="text-lg font-semibold text-green-600 mb-2">
                          Congratulations! You got it right!
                        </p>
                      </div>
                    ) : userClickedRecord ? ( // Only show "Try again!" if user has clicked record
                      <div>
                        <p className="text-lg font-semibold text-red-600 mb-2">
                          Try again! Your pronunciation needs practice.
                        </p>
                        <Button
                          variant="outline"
                          onClick={handleRecord}
                          className="mt-4 border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" /> Try Again
                        </Button>
                      </div>
                    ) : null // Don't show anything if no attempt has been made
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Card className="border-emerald-200 bg-emerald-50 mt-2">
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleGoBackOneStep}
                  className="border-gray-600 text-gray-600 hover:bg-gray-100"
                >
                  Go Back
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetPractice}
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-100"
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset{" "}
                  <span className="hidden sm:inline">Practice</span>
                </Button>
                <Button
                  onClick={handleNextContent}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeakingPracticeCards;
