import React, { useEffect, useState } from "react";
import { Mic, MicOff, Play, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useSpeech, useVoices } from "react-text-to-speech";
import Confetti from "react-confetti";

const SpeakingPractice = () => {
  const navigate = useNavigate();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [completedPhrases, setCompletedPhrases] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [userClickedRecord, setUserClickedRecord] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true); // State for sound toggle
  const [successAudio, setSuccessAudio] = useState<HTMLAudioElement | null>(
    null
  ); // State for success audio
  const [failAudio, setFailAudio] = useState<HTMLAudioElement | null>(null); // State for fail audio
  const [grandSuccessAudio, setGrandSuccessAudio] =
    useState<HTMLAudioElement | null>(null); // State for grand success audio
  const [isSoundPlaying, setIsSoundPlaying] = useState(false); // State to track if sound is playing

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const cleanAndSplitText = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[.,!?;:]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);
  };

  const compareTranscriptToPhrase = (
    phraseText: string,
    transcript: string
  ): JSX.Element[] => {
    const phraseWordsWithPunctuation = phraseText
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const cleanedPhraseWords = cleanAndSplitText(phraseText);
    const transcriptWords = cleanAndSplitText(transcript);

    const result: JSX.Element[] = [];
    const minLength = Math.min(
      phraseWordsWithPunctuation.length,
      transcriptWords.length
    );

    for (let i = 0; i < phraseWordsWithPunctuation.length; i++) {
      const originalPhraseWord = phraseWordsWithPunctuation[i];
      const cleanedPhraseWord = cleanedPhraseWords[i]; // Might be undefined if phraseWordsWithPunctuation has more words
      const transcriptWord = transcriptWords[i]; // Might be undefined

      if (i < minLength && cleanedPhraseWord === transcriptWord) {
        // Match
        result.push(
          <span key={i} className="text-green-600 mr-1">
            {originalPhraseWord}
          </span>
        );
      } else if (i < minLength && cleanedPhraseWord !== transcriptWord) {
        // Mismatch
        result.push(
          <span key={i} className="text-red-600 mr-1">
            {originalPhraseWord}
          </span>
        );
      } else {
        // Phrase word beyond transcript length or no corresponding transcript word
        result.push(
          <span key={i} className="text-gray-800 mr-1">
            {originalPhraseWord}
          </span>
        );
      }
    }

    return result;
  };

  const isMatch = (phraseText: string, transcript: string): boolean => {
    const cleanedPhraseWords = cleanAndSplitText(phraseText);
    const transcriptWords = cleanAndSplitText(transcript);

    if (cleanedPhraseWords.length !== transcriptWords.length) {
      return false;
    }

    for (let i = 0; i < cleanedPhraseWords.length; i++) {
      if (cleanedPhraseWords[i] !== transcriptWords[i]) {
        return false;
      }
    }

    return true;
  };

  // Dummy data for phrases
  const phrases = [
    {
      id: 1,
      text: "Hello, how are you today?",
      level: "Beginner",
      category: "Greetings",
    },
    {
      id: 2,
      text: "I would like to order a coffee, please.",
      level: "Beginner",
      category: "Food & Drinks",
    },
    {
      id: 3,
      text: "Could you help me find the nearest subway station?",
      level: "Intermediate",
      category: "Directions",
    },
    {
      id: 4,
      text: "I'm excited about the upcoming presentation next week.",
      level: "Intermediate",
      category: "Work",
    },
    {
      id: 5,
      text: "The weather forecast suggests it might rain tomorrow.",
      level: "Advanced",
      category: "Weather",
    },
  ];

  const currentPhrase = phrases[currentPhraseIndex];
  const progress = (completedPhrases / phrases.length) * 100;

  const { languages, voices } = useVoices();
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const { speechStatus, start, pause, stop } = useSpeech({
    text: currentPhrase.text,
    lang: selectedLanguage,
    voiceURI: selectedVoiceURI,
    pitch: 0.8, // Added pitch
    rate: 1.1, // Added rate
  });

  // Load audio files on component mount and clean up on unmount
  useEffect(() => {
    const success = new Audio("/success.mp3");
    success.loop = false; // Ensure audio plays only once
    const fail = new Audio("/fail.mp3");
    fail.loop = false; // Ensure audio plays only once
    const grandSuccess = new Audio("/grand-success.mp3");
    grandSuccess.loop = false; // Ensure audio plays only once
    setSuccessAudio(success);
    setFailAudio(fail);
    setGrandSuccessAudio(grandSuccess);

    return () => {
      success.pause();
      fail.pause();
      grandSuccess.pause();
      setSuccessAudio(null);
      setFailAudio(null);
      setGrandSuccessAudio(null);
    };
  }, []);

  useEffect(() => {
    if (voices.length > 0) {
      let voice = null;
      if (selectedLanguage === "en-GB") {
        voice = voices.find((v) =>
          v.voiceURI.includes("Google UK English Male")
        );
      } else {
        // Default to en-US
        voice = voices.find((v) => v.lang === "en-US");
        if (!voice) {
          voice = voices.find((v) => v.lang.startsWith("en"));
        }
      }
      if (voice) {
        setSelectedVoiceURI(voice.voiceURI);
      } else {
        // Fallback or handle case where desired voice is not found
        console.warn(`Desired voice for ${selectedLanguage} not found.`);
        setSelectedVoiceURI(""); // Or a default fallback voiceURI
      }
    }
  }, [voices, selectedLanguage]);

  useEffect(() => {
    if (listening || !transcript || isSoundPlaying) return; // Don't process if listening or sound is playing

    // Listening has stopped and there is a transcript
    const match = isMatch(currentPhrase.text, transcript);
    setShowCongratulations(match);

    const handleSoundEnd = () => {
      setIsSoundPlaying(false);
      if (match) {
        // Correct match
        if (currentPhraseIndex < phrases.length - 1) {
          handleNextPhrase(); // This already calls startListening and resets state
        } else {
          // End of session - play grand success sound if enabled
          if (soundEnabled && grandSuccessAudio) {
            setIsSoundPlaying(true);
            setShowCompletionScreen(true); // Show completion screen immediately when grand success sound starts
            grandSuccessAudio.play();
            grandSuccessAudio.onended = () => {
              setIsSoundPlaying(false);
              // setShowCompletionScreen(true); // Moved this call
            };
          } else {
            setShowCompletionScreen(true); // Show completion screen immediately if sound is disabled
          }
        }
      } else {
        // Incorrect match
        if (userClickedRecord) {
          // If user initiated recording and it was incorrect, restart listening
          SpeechRecognition.startListening();
        }
      }
    };

    if (soundEnabled && (successAudio || failAudio)) {
      setIsSoundPlaying(true);
      if (match && successAudio) {
        successAudio.play();
        successAudio.onended = handleSoundEnd;
      } else if (!match && failAudio) {
        failAudio.play();
        failAudio.onended = handleSoundEnd;
      } else {
        // If sound is disabled or audio objects are null, proceed immediately
        setIsSoundPlaying(false);
        handleSoundEnd();
      }
    } else {
      // If sound is disabled, proceed immediately
      handleSoundEnd();
    }
  }, [
    listening,
    transcript,
    currentPhrase.text,
    currentPhraseIndex,
    phrases.length,
    navigate,
    userClickedRecord,
    soundEnabled,
    successAudio,
    failAudio,
    grandSuccessAudio,
    // Removed isSoundPlaying from dependencies to prevent re-triggering after sound ends
    soundEnabled,
  ]);

  const handleRecord = () => {
    if (!listening) {
      setUserClickedRecord(true);
      SpeechRecognition.startListening();
    } else {
      setUserClickedRecord(false);
      SpeechRecognition.stopListening();
    }
  };

  const handlePlayPhrase = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    }
    start();
    console.log(`Playing phrase: ${currentPhrase.text}`);
  };

  const handleRetry = () => {
    if (isSoundPlaying) return; // Prevent retry while sound is playing
    // Reset recording for current phrase
    resetTranscript();
    setShowCongratulations(false);
  };

  const handleNextPhrase = () => {
    if (isSoundPlaying) return; // Prevent next phrase while sound is playing
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setCompletedPhrases(completedPhrases + 1);
      resetTranscript(); // Reset transcript for the new phrase
      setShowCongratulations(false); // Hide congratulations for the new phrase
      setUserClickedRecord(true); // Set userClickedRecord to true *before* starting listening
      // Automatically start listening for the next phrase
      SpeechRecognition.startListening();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-emerald-50">
      {showCompletionScreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
          />
          <Card className="w-full max-w-md text-center border-emerald-200">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-emerald-700">
                Course Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-gray-700">
                Congratulations on completing all the speaking practice phrases!
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-3"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Speaking Practice
            </h1>
            <p className="text-sm text-gray-600">
              {currentPhrase.level} • {currentPhrase.category}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Sound Toggle */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sound-toggle" className="text-sm text-gray-600">
                Sound Effects
              </label>
              <input
                type="checkbox"
                id="sound-toggle"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="form-checkbox h-4 w-4 text-emerald-600 transition duration-150 ease-in-out"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {completedPhrases} of {phrases.length} completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {/* Phrase Display Card */}
            <Card className="border-emerald-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  Practice This Phrase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                  <p className="text-xl text-center text-gray-800 leading-relaxed mb-4">
                    {compareTranscriptToPhrase(currentPhrase.text, transcript)}
                  </p>

                  {/* Display transcript only if not listening and transcript exists */}
                  {!listening && transcript && (
                    <p className="text-xl text-center text-gray-800 leading-relaxed mt-4">
                      Your attempt: {transcript}
                    </p>
                  )}
                </div>

                <div className="flex justify-center mb-6">
                  <Button
                    variant="outline"
                    onClick={handlePlayPhrase}
                    disabled={isSoundPlaying} // Disable button while sound is playing
                    className="flex items-center space-x-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Play className="h-4 w-4" />
                    <span>Listen to Phrase</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSelectedLanguage((prevLang) =>
                        prevLang === "en-US" ? "en-GB" : "en-US"
                      )
                    }
                    disabled={isSoundPlaying} // Disable button while sound is playing
                    className="flex items-center space-x-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 ml-4" // Added ml-4 for spacing
                  >
                    <span>
                      Switch to{" "}
                      {selectedLanguage === "en-US"
                        ? "UK English"
                        : "US English"}
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
                    {listening ? (
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
                    ) : transcript && transcript.length > 0 ? (
                      <div>
                        <p className="text-lg font-semibold text-red-600 mb-2">
                          Transcript Mismatch
                        </p>
                        <p className="text-sm text-gray-600">
                          Your transcript didn't match the phrase. Try again.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-semibold text-gray-800 mb-2">
                          Ready to Record
                        </p>
                        <p className="text-sm text-gray-600">
                          Click the microphone to start
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-emerald-200 bg-emerald-50 mt-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  💡 Speaking Tips:
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Speak clearly and at a natural pace</li>
                  <li>• Try to match the pronunciation you heard</li>
                  <li>
                    • Don't worry about perfection - practice makes progress!
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingPractice;
