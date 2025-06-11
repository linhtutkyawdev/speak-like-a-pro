import { useEffect, useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useSpeech, useVoices } from "react-text-to-speech";
import Confetti from "react-confetti";
import { isMatch } from "@/lib/speechUtils";
import SpeakingPracticeCards from "@/components/SpeakingPracticeCards"; // Will replace with demo version
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Volume2, VolumeX, ArrowLeft, X } from "lucide-react";

// Mock data for demo purposes
const mockLesson = {
  _id: "mockLessonId",
  _creationTime: Date.now(),
  courseId: "mockCourseId",
  title: "Demo Speaking Practice",
  description: "Practice common phrases and sentences.",
  phrases: [
    "Hello, how are you?",
    "Nice to meet you.",
    "Thank you very much.",
    "Excuse me, please.",
  ],
  sentences: [
    { text: "I am learning English speaking.", wordCount: 5 },
    { text: "Practice makes perfect.", wordCount: 3 },
    { text: "Could you please repeat that?", wordCount: 5 },
  ],
};

const SpeakingPracticeDemo = () => {
  const navigate = useNavigate();

  // Mock lesson and user progress for demo
  const lesson = mockLesson;
  const userProgress = {
    completedContentCount: 0,
    pointsEarned: 0,
    lastPracticedAt: Date.now(),
  };

  const [practiceMode, setPracticeMode] = useState<"phrases" | "sentences">(
    "phrases"
  );

  useEffect(() => {
    if (lesson) {
      if (lesson.phrases && lesson.phrases.length > 0) {
        setPracticeMode("phrases");
      } else if (lesson.sentences && lesson.sentences.length > 0) {
        setPracticeMode("sentences");
      }
    }
  }, [lesson]);

  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [completedContentCount, setCompletedContentCount] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);
  const [userClickedRecord, setUserClickedRecord] = useState(false);
  const isMobile = useIsMobile();
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // Show mobile warning if on mobile and it hasn't been dismissed before
  useEffect(() => {
    if (isMobile && localStorage.getItem("dismissMobileWarning") !== "true") {
      setShowMobileWarning(true);
    }
  }, [isMobile]);
  const [soundEnabled, setSoundEnabled] = useState(!isMobile);
  const [successAudio, setSuccessAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [failAudio, setFailAudio] = useState<HTMLAudioElement | null>(null);
  const [grandSuccessAudio, setGrandSuccessAudio] =
    useState<HTMLAudioElement | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [isSpeechRecognitionReady, setIsSpeechRecognitionReady] =
    useState(false);
  const [practiceStartTime, setPracticeStartTime] = useState<number | null>(
    null
  );

  // Set practice start time on component mount
  useEffect(() => {
    setPracticeStartTime(Date.now());
  }, []);

  const contentToPractice =
    practiceMode === "phrases"
      ? lesson?.phrases || []
      : lesson?.sentences.map((s) => s.text) || [];
  const currentContent = contentToPractice[currentContentIndex] || "";
  const currentContentWordCount = (() => {
    const text = currentContent
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s{2,}/g, " ");
    return practiceMode === "phrases"
      ? text.split(/\s+/).filter(Boolean).length
      : practiceMode === "sentences" && lesson?.sentences[currentContentIndex]
        ? lesson.sentences[currentContentIndex].wordCount
        : 0;
  })();
  const totalContentCount =
    (lesson?.phrases?.length || 0) + (lesson?.sentences?.length || 0);
  const progress =
    totalContentCount > 0
      ? (completedContentCount / totalContentCount) * 100
      : 0;

  const [windowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { voices } = useVoices();
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const { start, stop } = useSpeech({
    text: currentContent,
    lang: selectedLanguage,
    voiceURI: selectedVoiceURI,
    pitch: 0.8,
    rate: 1.1,
  });

  useEffect(() => {
    const success = new Audio("/success.mp3");
    success.loop = false;
    const fail = new Audio("/fail.mp3");
    fail.loop = false;
    const grandSuccess = new Audio("/grand-success.mp3");
    grandSuccess.loop = false;
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
    if (browserSupportsSpeechRecognition && successAudio) {
      setIsSpeechRecognitionReady(true);
    }
  }, [browserSupportsSpeechRecognition, successAudio]);

  useEffect(() => {
    if (voices.length > 0) {
      let voice = null;
      if (selectedLanguage === "en-GB") {
        voice = voices.find((v) =>
          v.voiceURI.includes("Google UK English Male")
        );
      } else {
        voice = voices.find((v) => v.lang === "en-US");
        if (!voice) {
          voice = voices.find((v) => v.lang.startsWith("en"));
        }
      }
      if (voice) {
        setSelectedVoiceURI(voice.voiceURI);
      } else {
        console.warn(`Desired voice for ${selectedLanguage} not found.`);
        setSelectedVoiceURI("");
      }
    }
  }, [voices, selectedLanguage]);

  useEffect(() => {
    if (!lesson || isSoundPlaying) return;
    if (listening || !transcript) {
      return;
    }

    const currentProcessedTranscript = transcript;
    resetTranscript();

    const match = isMatch(currentContent, currentProcessedTranscript);
    setShowCongratulations(match);

    const handleMatchAndAdvance = async () => {
      if (match) {
        const newCompletedCount = completedContentCount + 1;
        setCompletedContentCount(newCompletedCount);

        let durationSeconds = 0;
        if (practiceStartTime !== null) {
          const endTime = Date.now();
          durationSeconds = Math.round((endTime - practiceStartTime) / 1000);
          setPracticeStartTime(endTime);
        }

        // No actual mutation for demo
        console.log("Demo: User progress would be updated here.");

        const currentContentArray =
          practiceMode === "phrases"
            ? lesson?.phrases || []
            : lesson?.sentences || [];

        if (currentContentIndex < currentContentArray.length - 1) {
          setCurrentContentIndex((prev) => prev + 1);
          setShowCongratulations(false);
          setUserClickedRecord(false); // Reset this to allow re-recording if needed
          resetTranscript(); // Clear transcript for next item
          await SpeechRecognition.startListening();
        } else {
          if (
            practiceMode === "phrases" &&
            lesson?.sentences &&
            lesson.sentences.length > 0
          ) {
            setPracticeMode("sentences");
            setCurrentContentIndex(0);
            setShowCongratulations(false);
            setUserClickedRecord(false); // Reset this
            resetTranscript(); // Clear transcript for next item
            await SpeechRecognition.startListening();
          } else {
            // Lesson completed - update last practiced at
            console.log("Demo: Lesson completion would be recorded here.");

            setShowCompletionScreen(true);
            setShowResetOption(false);
            if (soundEnabled && grandSuccessAudio) {
              setIsSoundPlaying(true);
              grandSuccessAudio.play();
              grandSuccessAudio.onended = () => {
                setIsSoundPlaying(false);
              };
            }
          }
        }
      } else {
        if (userClickedRecord) {
          await SpeechRecognition.startListening();
        }
      }
    };

    if (soundEnabled) {
      setIsSoundPlaying(true);
      const audioToPlay = match ? successAudio : failAudio;
      if (audioToPlay) {
        audioToPlay.play();
        audioToPlay.onended = () => {
          setIsSoundPlaying(false);
          handleMatchAndAdvance();
        };
      } else {
        handleMatchAndAdvance();
      }
    } else {
      handleMatchAndAdvance();
    }
  }, [
    listening,
    transcript,
    currentContent,
    currentContentIndex,
    practiceMode,
    totalContentCount,
    userClickedRecord,
    soundEnabled,
    successAudio,
    failAudio,
    grandSuccessAudio,
    lesson,
    setCompletedContentCount,
    resetTranscript,
    setShowCongratulations,
    setUserClickedRecord,
    setCurrentContentIndex,
    setPracticeMode,
    setShowCompletionScreen,
    setIsSoundPlaying,
    practiceStartTime, // Added to dependency array
  ]);

  const handleRecord = async () => {
    if (!listening) {
      setUserClickedRecord(true);
      stop();
      await SpeechRecognition.startListening();
    } else {
      setUserClickedRecord(false);
      await SpeechRecognition.stopListening();
    }
  };

  const handlePlayContent = async () => {
    if (listening) {
      await SpeechRecognition.stopListening();
    }
    start();
  };

  const handleNextContent = useCallback(async () => {
    if (isSoundPlaying) return;

    const currentContentArray =
      practiceMode === "phrases"
        ? lesson?.phrases || []
        : lesson?.sentences || [];

    if (currentContentIndex < currentContentArray.length - 1) {
      setCurrentContentIndex((prev) => prev + 1);
      resetTranscript();
      setShowCongratulations(false);
      setUserClickedRecord(false);
      await SpeechRecognition.startListening();
    } else {
      if (
        practiceMode === "phrases" &&
        lesson?.sentences &&
        lesson.sentences.length > 0
      ) {
        setPracticeMode("sentences");
        setCurrentContentIndex(0);
        resetTranscript();
        setShowCongratulations(false);
        setUserClickedRecord(false);
        await SpeechRecognition.startListening();
      } else {
        setShowCompletionScreen(true);
      }
    }
  }, [
    isSoundPlaying,
    currentContentIndex,
    practiceMode,
    lesson,
    resetTranscript,
    setShowCongratulations,
    setUserClickedRecord,
    setCurrentContentIndex,
    setPracticeMode,
    setShowCompletionScreen,
  ]);

  if (!lesson || userProgress === undefined) {
    return <LoadingSpinner />;
  }
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  if (!isSpeechRecognitionReady) {
    return <LoadingSpinner />;
  }

  if (
    (!lesson.phrases || lesson.phrases.length === 0) &&
    (!lesson.sentences || lesson.sentences.length === 0)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No content (phrases or sentences) available for this lesson.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-emerald-50 flex flex-col">
      <AppHeader
        rightContent={
          <>
            <Button variant="ghost" onClick={() => navigate("/signin")}>
              Sign In
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </>
        }
      />
      {showCompletionScreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm p-4">
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
          />
          <Card className="w-full max-w-md text-center border-emerald-200 mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-emerald-700">
                {showResetOption ? "Lesson Completed!" : "Congratulations!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-gray-700">
                {showResetOption
                  ? "You've completed this lesson. You can reset to practice again or go back to the course."
                  : "Congratulations on completing all the speaking practice content!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={async () => {
                    setCurrentContentIndex(0);
                    setCompletedContentCount(0);
                    setPracticeMode(
                      lesson?.phrases && lesson.phrases.length > 0
                        ? "phrases"
                        : "sentences"
                    );
                    resetTranscript();
                    setShowCongratulations(false);
                    setUserClickedRecord(false);
                    // No actual mutation for demo
                    console.log("Demo: User progress would be reset here.");
                    setShowCompletionScreen(false);
                    setShowResetOption(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                >
                  Reset Practice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")} // Go back to landing page for demo
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 flex-1"
                >
                  Back to Landing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isMobile && showMobileWarning && (
        <Alert className="mb-4 max-w-4xl mx-auto bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertDescription className="flex items-center justify-between">
            <span>
              For the best experience, please use a desktop browser for speaking
              practice.
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowMobileWarning(false);
                localStorage.setItem("dismissMobileWarning", "true");
              }}
              className="text-yellow-800 hover:bg-yellow-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-4xl min-w-[20rem] mx-auto border-emerald-200 bg-white border rounded-lg p-4 my-4">
        <div className="mx-auto flex items-center justify-between mb-2">
          {/* Back to Course Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-emerald-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-grow">
            <h1 className="text-xl font-bold text-gray-900">
              Speaking Practice
            </h1>
            <p className="text-sm text-gray-600">{lesson?.title}</p>
          </div>
          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-gray-600 hover:text-emerald-600"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full mx-auto flex items-center">
          <Progress
            value={progress}
            className="h-4 rounded-full shadow-lg transition-all duration-500 ease-out"
          />

          <div className="text-right">
            <p className="text-sm text-gray-600 text-nowrap ml-3">
              {completedContentCount} / {totalContentCount}
            </p>
          </div>
        </div>
      </div>

      <SpeakingPracticeCards
        practiceMode={practiceMode}
        currentContent={currentContent}
        transcript={transcript}
        listening={listening}
        showCongratulations={showCongratulations}
        userClickedRecord={userClickedRecord}
        handlePlayContent={handlePlayContent}
        handleRecord={handleRecord}
        handleNextContent={handleNextContent}
        handleResetPractice={async () => {
          setCurrentContentIndex(0);
          setCompletedContentCount(0);
          setPracticeMode(
            lesson?.phrases && lesson.phrases.length > 0
              ? "phrases"
              : "sentences"
          );
          resetTranscript();
          setShowCongratulations(false);
          setUserClickedRecord(false);
          // No actual mutation for demo
          console.log("Demo: User progress would be reset here.");
          setShowCompletionScreen(false);
          setShowResetOption(false);
        }}
        handleGoBackOneStep={async () => {
          if (isSoundPlaying) return;

          const totalPhrases = lesson?.phrases?.length || 0;

          if (currentContentIndex > 0) {
            // Go back within the current mode
            setCurrentContentIndex((prev) => prev - 1);
            setCompletedContentCount((prev) => Math.max(0, prev - 1)); // Decrement completed count
          } else if (practiceMode === "sentences" && totalPhrases > 0) {
            // Transition from sentences back to phrases
            setPracticeMode("phrases");
            setCurrentContentIndex(totalPhrases - 1); // Go to the last phrase
            setCompletedContentCount(totalPhrases - 1); // Set completed count to total phrases - 1
          } else {
            // Already at the beginning of phrases, cannot go back further
            console.log("Already at the beginning of the practice.");
            return;
          }
          resetTranscript();
          setShowCongratulations(false);
          setUserClickedRecord(false);
          await SpeechRecognition.startListening();
        }}
        isSoundPlaying={isSoundPlaying}
        setSelectedLanguage={setSelectedLanguage}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
};

export default SpeakingPracticeDemo;
