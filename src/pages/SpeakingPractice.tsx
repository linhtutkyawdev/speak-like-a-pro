import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, useParams } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useSpeech, useVoices } from "react-text-to-speech";
import Confetti from "react-confetti";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { isMatch } from "@/lib/speechUtils";
import SpeakingPracticeCards from "@/components/SpeakingPracticeCards";
import LoadingSpinner from "@/components/LoadingSpinner"; // Import LoadingSpinner
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import AppHeaderRightContent from "@/components/AppHeaderRightContent";
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { Volume2, VolumeX, ArrowLeft } from "lucide-react"; // Import icons for sound toggle and back arrow

const SpeakingPractice = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const lesson = useQuery(
    api.lessons.getLesson,
    lessonId ? { lessonId: lessonId as Id<"lessons"> } : undefined
  );

  const allLessonsInCourse = useQuery(
    api.lessons.getLessonsByCourseId,
    courseId ? { courseId: courseId as Id<"courses"> } : undefined
  );

  const userProgress = useQuery(
    api.users.getUserProgress,
    lessonId && isLoaded && isSignedIn
      ? { lessonId: lessonId as Id<"lessons"> }
      : "skip"
  );

  const updateUserProgressMutation = useMutation(api.users.updateUserProgress);

  const [practiceMode, setPracticeMode] = useState<"phrases" | "sentences">(
    "phrases"
  );

  // Initialize practiceMode based on lesson content
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
  const [showResetOption, setShowResetOption] = useState(false); // New state for reset option
  const [userClickedRecord, setUserClickedRecord] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [successAudio, setSuccessAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [failAudio, setFailAudio] = useState<HTMLAudioElement | null>(null);
  const [grandSuccessAudio, setGrandSuccessAudio] =
    useState<HTMLAudioElement | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [isSpeechRecognitionReady, setIsSpeechRecognitionReady] =
    useState(false); // New state
  const [practiceStartTime, setPracticeStartTime] = useState<number | null>(
    null
  ); // State to track practice start time
  const [speechAttemptStartTime, setSpeechAttemptStartTime] = useState<
    number | null
  >(null); // New state to track individual speech attempt start time
  const [speechAttemptDuration, setSpeechAttemptDuration] = useState<
    number | null
  >(null); // New state to store individual speech attempt duration
  const [totalPracticeSessionSeconds, setTotalPracticeSessionSeconds] =
    useState(0); // State to accumulate practice time in seconds for the current session

  // Initialize practiceMode and currentContentIndex based on lesson content and user progress
  useEffect(() => {
    if (lesson && userProgress !== undefined) {
      let initialIndex = 0;
      let initialMode: "phrases" | "sentences" = "phrases";

      if (userProgress) {
        initialIndex = userProgress.completedContentCount;
        // Determine initial mode based on where the user left off
        const totalPhrases = lesson.phrases?.length || 0;
        if (initialIndex >= totalPhrases && lesson.sentences?.length > 0) {
          initialMode = "sentences";
          initialIndex -= totalPhrases; // Adjust index for sentences mode
        }
      } else {
        // If no user progress, start from the beginning of phrases or sentences
        if (lesson.phrases && lesson.phrases.length > 0) {
          initialMode = "phrases";
        } else if (lesson.sentences && lesson.sentences.length > 0) {
          initialMode = "sentences";
        }
      }

      setPracticeMode(initialMode);
      setCurrentContentIndex(initialIndex);
      setCompletedContentCount(userProgress?.completedContentCount || 0);
      if (!practiceStartTime) {
        setPracticeStartTime(Date.now()); // Set start time when component mounts and data is ready, only if not already set
      }

      // Check if the lesson is completed to show reset option
      const totalContent =
        (lesson.phrases?.length || 0) + (lesson.sentences?.length || 0);
      if (
        userProgress &&
        userProgress.completedContentCount >= totalContent &&
        totalContent > 0
      ) {
        setShowResetOption(true);
        setShowCompletionScreen(true); // Show completion screen if lesson is completed
      } else {
        setShowResetOption(false);
        setShowCompletionScreen(false); // Hide completion screen if lesson is not completed
      }
    }
  }, [lesson, userProgress]);

  // Derived state based on lesson and practiceMode
  const contentToPractice =
    practiceMode === "phrases"
      ? lesson?.phrases || []
      : lesson?.sentences.map((s) => s.text) || [];
  const currentContent = contentToPractice[currentContentIndex] || "";
  const currentContentWordCount = (() => {
    const text = currentContent
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s{2,}/g, " "); // Remove punctuation and extra spaces
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

  const [windowDimensions, setWindowDimensions] = useState({
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

  // Set isSpeechRecognitionReady to true when browser supports it and audio is loaded
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
    if (!lesson || !lessonId || !courseId) return; // Ensure lesson data and IDs are loaded before proceeding
    if (listening || !transcript || isSoundPlaying) {
      return;
    }

    // Capture current transcript and immediately clear it to prevent re-processing
    const currentProcessedTranscript = transcript;
    resetTranscript();

    const match = isMatch(currentContent, currentProcessedTranscript);
    setShowCongratulations(match);

    const handleMatchAndAdvance = async () => {
      if (match) {
        const newCompletedCount = completedContentCount + 1;
        setCompletedContentCount(newCompletedCount);

        // Calculate duration for the current content item in seconds
        let durationSeconds = 0;
        if (practiceStartTime !== null) {
          const endTime = Date.now();
          durationSeconds = Math.round((endTime - practiceStartTime) / 1000); // Convert ms to seconds
          setPracticeStartTime(endTime); // Reset start time for the next content item
          setTotalPracticeSessionSeconds((prev) => prev + durationSeconds); // Accumulate for session
        }

        await updateUserProgressMutation({
          lessonId: lessonId as Id<"lessons">,
          courseId: courseId as Id<"courses">,
          completedContentCount: newCompletedCount,
          pointsEarned: currentContentWordCount,
          contentIndex: currentContentIndex,
          contentType: practiceMode === "phrases" ? "phrase" : "sentence",
          practiceDurationSeconds: durationSeconds, // Pass duration in seconds
        });

        const currentContentArray =
          practiceMode === "phrases"
            ? lesson?.phrases || []
            : lesson?.sentences || [];

        if (currentContentIndex < currentContentArray.length - 1) {
          setCurrentContentIndex((prev) => prev + 1);
          setShowCongratulations(false);
          setUserClickedRecord(true);
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
            setUserClickedRecord(true);
            await SpeechRecognition.startListening();
          } else {
            // Lesson completed - update last practiced at
            await updateUserProgressMutation({
              lessonId: lessonId as Id<"lessons">,
              courseId: courseId as Id<"courses">,
              completedContentCount: newCompletedCount, // Use the updated count
              pointsEarned: 0, // No new points for just completing the lesson
              contentIndex: -1, // No specific content index for overall completion
              contentType: "sentence", // Placeholder, as it's overall completion
              practiceDurationSeconds: 0, // No duration for overall completion
            });

            setShowCompletionScreen(true);
            setShowResetOption(false); // Ensure reset option is not shown immediately after completion
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

    // Play sound if enabled, then execute handleMatchAndAdvance
    if (soundEnabled) {
      setIsSoundPlaying(true);
      const audioToPlay = match ? successAudio : failAudio;
      if (audioToPlay) {
        audioToPlay.play();
        audioToPlay.onended = () => {
          setIsSoundPlaying(false);
          handleMatchAndAdvance(); // Call advance logic after sound ends
        };
      } else {
        handleMatchAndAdvance(); // If no audio to play, execute immediately
      }
    } else {
      handleMatchAndAdvance(); // If sound is disabled, execute immediately
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
    lessonId,
    courseId,
    updateUserProgressMutation,
    completedContentCount,
    resetTranscript,
    setShowCongratulations,
    setUserClickedRecord,
    setCurrentContentIndex,
    setCompletedContentCount,
    setPracticeMode,
    setShowCompletionScreen,
    setIsSoundPlaying,
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
      // Move to the next item in the current mode (manual skip)
      setCurrentContentIndex((prev) => prev + 1);
      resetTranscript();
      setShowCongratulations(false);
      setUserClickedRecord(false); // User didn't record this one
      await SpeechRecognition.startListening();
    } else {
      // Current mode (phrases or sentences) completed by skipping
      if (
        practiceMode === "phrases" &&
        lesson?.sentences &&
        lesson.sentences.length > 0
      ) {
        // Transition from phrases to sentences (manual skip)
        setPracticeMode("sentences");
        setCurrentContentIndex(0);
        resetTranscript();
        setShowCongratulations(false);
        setUserClickedRecord(false); // User didn't record this one
        await SpeechRecognition.startListening();
      } else {
        // All content (phrases and sentences) completed by skipping
        setShowCompletionScreen(true); // Show completion screen even if skipped
      }
    }
  }, [
    isSoundPlaying,
    currentContentIndex,
    practiceMode,
    lesson,
    resetTranscript,
    setShowCongratulations, // Added for completeness
    setUserClickedRecord, // Added for completeness
    setCurrentContentIndex, // Added for completeness
    setPracticeMode, // Added for completeness
    setShowCompletionScreen, // Added for completeness
  ]);

  // Conditional returns moved after all hooks
  if (!isLoaded || !lesson || userProgress === undefined) {
    // Added userProgress check
    return <LoadingSpinner />; // Show loading spinner while data is fetching
  }
  if (!isSignedIn) {
    return <Navigate to="/signin" />;
  }
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // Show loading spinner until speech recognition is ready
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
      <AppHeader rightContent={<AppHeaderRightContent />} />
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
                    if (lessonId && courseId) {
                      await updateUserProgressMutation({
                        lessonId: lessonId as Id<"lessons">,
                        courseId: courseId as Id<"courses">,
                        completedContentCount: 0,
                        pointsEarned: 0, // No points awarded on reset
                        contentIndex: -1, // Indicate reset, no specific content
                        contentType:
                          lesson?.phrases && lesson.phrases.length > 0
                            ? "phrase"
                            : "sentence",
                        practiceDurationSeconds: 0, // Reset duration on reset
                      });
                    }
                    setShowCompletionScreen(false); // Hide completion screen after reset
                    setPracticeStartTime(Date.now()); // Reset practice start time
                    setTotalPracticeSessionSeconds(0); // Reset accumulated session time
                  }}
                  className="border-red-600 text-red-600 hover:bg-red-100 text-lg px-8 py-3 w-full mt-4"
                  variant="outline"
                >
                  Reset Practice
                </Button>
                <Button
                  onClick={() => {
                    setShowCompletionScreen(false);
                    navigate(`/course/${courseId}`);
                  }}
                  className="mt-4 w-full"
                  variant="outline"
                >
                  Back to Course
                </Button>
              </div>
              {allLessonsInCourse && lesson && (
                <Button
                  onClick={() => {
                    // allLessonsInCourse is already sorted by _creationTime from the Convex query
                    const currentLessonIndex = allLessonsInCourse.findIndex(
                      (l) => l._id === lesson._id
                    );
                    const nextLesson =
                      allLessonsInCourse[currentLessonIndex + 1];
                    if (nextLesson) {
                      setShowCompletionScreen(false); // Close the completion screen
                      navigate(`/practice/${courseId}/${nextLesson._id}`);
                    } else {
                      setShowCompletionScreen(false); // Close the completion screen
                      navigate("/"); // No more lessons, go to home
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-3 w-full"
                >
                  Continue to Next Lesson
                </Button>
              )}

              <Button
                onClick={() => {
                  setShowCompletionScreen(false); // Only close the completion screen
                }}
                className="mt-4 w-full"
                variant="outline"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {!showCompletionScreen && (
        <>
          <div className="max-w-4xl mx-auto border-emerald-200  bg-white border rounded-lg p-4 my-4">
            <div className="mx-auto flex items-center justify-between mb-2">
              {/* Back to Course Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/course/${courseId}`)}
                className="text-gray-600 hover:text-emerald-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="text-center flex-grow">
                <h1 className="text-xl font-bold text-gray-900">
                  Speaking Practice
                </h1>
                <p className="text-sm text-gray-600">{lesson.title}</p>
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
              if (lessonId && courseId) {
                await updateUserProgressMutation({
                  lessonId: lessonId as Id<"lessons">,
                  courseId: courseId as Id<"courses">,
                  completedContentCount: 0,
                  pointsEarned: 0, // No points awarded on reset
                  contentIndex: -1, // Indicate reset, no specific content
                  contentType:
                    lesson?.phrases && lesson.phrases.length > 0
                      ? "phrase"
                      : "sentence",
                });
              }
            }}
            handleGoBackOneStep={async () => {
              const newContentIndex = currentContentIndex - 1;
              if (newContentIndex >= 0) {
                setCurrentContentIndex(newContentIndex);
                setCompletedContentCount((prev) => Math.max(0, prev - 1)); // Decrement completed count
                resetTranscript();
                setShowCongratulations(false);
                setUserClickedRecord(false);
                if (lessonId && courseId) {
                  // Update user progress to reflect going back
                  await updateUserProgressMutation({
                    lessonId: lessonId as Id<"lessons">,
                    courseId: courseId as Id<"courses">,
                    completedContentCount: Math.max(
                      0,
                      completedContentCount - 1
                    ), // Decrement
                    pointsEarned: 0, // No points change for going back
                    contentIndex: newContentIndex,
                    contentType:
                      practiceMode === "phrases" ? "phrase" : "sentence",
                  });
                }
              } else if (
                practiceMode === "sentences" &&
                lesson?.phrases &&
                lesson.phrases.length > 0
              ) {
                // If at the beginning of sentences, go back to phrases
                setPracticeMode("phrases");
                setCurrentContentIndex(lesson.phrases.length - 1);
                setCompletedContentCount((prev) => Math.max(0, prev - 1)); // Decrement completed count
                resetTranscript();
                setShowCongratulations(false);
                setUserClickedRecord(false);
                if (lessonId && courseId) {
                  await updateUserProgressMutation({
                    lessonId: lessonId as Id<"lessons">,
                    courseId: courseId as Id<"courses">,
                    completedContentCount: Math.max(
                      0,
                      completedContentCount - 1
                    ), // Decrement
                    pointsEarned: 0, // No points change for going back
                    contentIndex: lesson.phrases.length - 1,
                    contentType: "phrase",
                  });
                }
              }
            }}
            isSoundPlaying={isSoundPlaying}
            setSelectedLanguage={setSelectedLanguage}
            selectedLanguage={selectedLanguage}
          />
        </>
      )}
    </div>
  );
};

export default SpeakingPractice;
