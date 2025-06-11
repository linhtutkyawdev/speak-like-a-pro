import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Play, Trophy, Target, Clock, Star, List } from "lucide-react"; // Added Star for points, List for lessons
import {
  INTERMEDIATE_POINTS_THRESHOLD,
  ADVANCED_POINTS_THRESHOLD,
  EXPERT_POINTS_THRESHOLD,
  BEGINNER_POINTS_THRESHOLD,
} from "@/lib/constants";

import AppHeader from "@/components/AppHeader";
import AppHeaderRightContent from "@/components/AppHeaderRightContent";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoaded: isUserLoaded } = useUser();
  const isMobile = useIsMobile();

  const userProfile = useQuery(
    api.users.getUserProfile,
    user ? { clerkUserId: user.id } : "skip"
  );

  const allUserProgress = useQuery(
    api.users.listAllUserProgress,
    user ? {} : "skip"
  );

  const allLessons = useQuery(api.lessons.listAllLessons);
  const allCourses = useQuery(api.courses.listAllCourses);

  const getUserLevel = (points: number) => {
    if (points >= EXPERT_POINTS_THRESHOLD) {
      return "God";
    } else if (points >= ADVANCED_POINTS_THRESHOLD) {
      return "Advanced";
    } else if (points >= INTERMEDIATE_POINTS_THRESHOLD) {
      return "Intermediate";
    } else if (points >= INTERMEDIATE_POINTS_THRESHOLD / 2) {
      return "Beginner";
    } else {
      return "Novice";
    }
  };

  if (
    !isUserLoaded ||
    userProfile === undefined ||
    allUserProgress === undefined ||
    allLessons === undefined ||
    allCourses === undefined
  ) {
    return <LoadingSpinner />;
  }

  const totalPoints = userProfile?.totalPoints || 0;
  const currentLevel = getUserLevel(totalPoints);

  // Calculate Lessons Completed
  const completedLessons = allUserProgress?.filter(
    (progress) =>
      progress.completedContentCount >=
      (allLessons?.find((l) => l._id === progress.lessonId)?.phrases?.length ||
        0) +
        (allLessons?.find((l) => l._id === progress.lessonId)?.sentences
          ?.length || 0)
  ).length;
  const totalLessons = allLessons?.length || 0;

  // Calculate Total Practice Time in seconds
  const totalPracticeSeconds =
    allUserProgress?.reduce(
      (sum, progress) => sum + (progress.practiceDurationSeconds || 0),
      0
    ) || 0;

  // Convert total seconds to a human-readable format (e.g., "Xm Ys" or "Xh Ym")
  const formatPracticeTime = (totalSeconds: number) => {
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Determine recent lessons
  const allLessonProgressData = allUserProgress
    ?.map((progress) => {
      const lesson = allLessons?.find((l) => l._id === progress.lessonId);
      if (!lesson) return null;

      const course = allCourses?.find((c) => c._id === lesson.courseId);
      if (!course) return null;

      const lessonTotalContent =
        (lesson.phrases?.length || 0) + (lesson.sentences?.length || 0);
      const lessonProgress =
        lessonTotalContent > 0
          ? Math.round(
              (progress.completedContentCount / lessonTotalContent) * 100
            )
          : 0;

      return {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        courseId: course._id,
        courseTitle: course.title,
        progress: lessonProgress,
        lastPracticedAt: progress.lastPracticedAt,
      };
    })
    .filter(Boolean); // Filter out nulls

  const recentLessons = allLessonProgressData
    ?.filter((lesson) => lesson.progress < 100) // Only include lessons not yet completed
    .sort((a, b) => (b.lastPracticedAt || 0) - (a.lastPracticedAt || 0))
    .slice(0, 3); // Get up to 3 most recent progress entries

  const completedLessonsData = allLessonProgressData
    ?.filter((lesson) => lesson.progress === 100) // Only include completed lessons
    .sort((a, b) => (b.lastPracticedAt || 0) - (a.lastPracticedAt || 0)); // Sort by most recently completed

  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <AppHeader rightContent={<AppHeaderRightContent />} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {user?.firstName || "User"}!
        </h1>

        {/* Stats Cards */}
        <div
          className={`grid gap-6 mb-8 ${
            isMobile ? "grid-cols-2 auto-rows-fr" : "grid-cols-1 md:grid-cols-4"
          }`}
        >
          <Card className={isMobile ? "aspect-square" : ""}>
            <CardContent
              className={`flex flex-col items-center justify-center h-full ${
                isMobile ? "p-3" : "p-6"
              }`}
            >
              <Trophy
                className={`${
                  isMobile ? "w-6 h-6" : "w-8 h-8"
                } text-green-600 mb-2`}
              />
              <p
                className={`font-medium text-gray-600 ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                Level
              </p>
              <p
                className={`font-bold text-gray-900 ${
                  isMobile ? "text-lg" : "text-2xl"
                }`}
              >
                {currentLevel}
              </p>
            </CardContent>
          </Card>

          <Card className={isMobile ? "aspect-square" : ""}>
            <CardContent
              className={`flex flex-col items-center justify-center h-full ${
                isMobile ? "p-3" : "p-6"
              }`}
            >
              <Star
                className={`${
                  isMobile ? "w-6 h-6" : "w-8 h-8"
                } text-yellow-500 mb-2`}
              />
              <p
                className={`font-medium text-gray-600 ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                Points
              </p>
              <p
                className={`font-bold text-gray-900 ${
                  isMobile ? "text-lg" : "text-2xl"
                }`}
              >
                {totalPoints}
              </p>
            </CardContent>
          </Card>

          <Card className={isMobile ? "aspect-square" : ""}>
            <CardContent
              className={`flex flex-col items-center justify-center h-full ${
                isMobile ? "p-3" : "p-6"
              }`}
            >
              <Target
                className={`${
                  isMobile ? "w-6 h-6" : "w-8 h-8"
                } text-green-600 mb-2`}
              />
              <p
                className={`font-medium text-gray-600 ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                Lessons
              </p>
              <p
                className={`font-bold text-gray-900 ${
                  isMobile ? "text-lg" : "text-2xl"
                }`}
              >
                {completedLessons}/{totalLessons}
              </p>
            </CardContent>
          </Card>

          <Card className={isMobile ? "aspect-square" : ""}>
            <CardContent
              className={`flex flex-col items-center justify-center h-full ${
                isMobile ? "p-3" : "p-6"
              }`}
            >
              <Clock
                className={`${
                  isMobile ? "w-6 h-6" : "w-8 h-8"
                } text-green-600 mb-2`}
              />
              <p
                className={`font-medium text-gray-600 ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                Time
              </p>
              <p
                className={`font-bold text-gray-900 ${
                  isMobile ? "text-lg" : "text-2xl"
                }`}
              >
                {formatPracticeTime(totalPracticeSeconds)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                {recentLessons.length > 0 ? (
                  recentLessons.map((lesson) => (
                    <div
                      key={lesson.lessonId}
                      className="relative flex flex-col p-3 bg-gray-50 rounded-lg shadow-sm"
                    >
                      <h3 className="font-semibold text-base text-gray-900 mb-1">
                        {lesson.lessonTitle}
                      </h3>
                      <p className="text-xs text-gray-700 mb-2">
                        From course:{" "}
                        <span className="font-medium">
                          {lesson.courseTitle}
                        </span>
                      </p>

                      <div className="flex items-center mb-1">
                        <Progress
                          value={lesson.progress}
                          className="w-full h-2"
                        />
                        <span className="ml-2 text-xs font-medium text-gray-700">
                          {lesson.progress}%
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-gray-600 mb-3">
                        <Clock className="w-3 h-3 mr-1 text-gray-500" />
                        <span>
                          Last practiced:{" "}
                          {formatTimestamp(lesson.lastPracticedAt)}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-8 text-sm"
                          onClick={() => {
                            navigate(`/course/${lesson.courseId}`);
                          }}
                        >
                          Go to Course
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-sm"
                          onClick={() => {
                            navigate(
                              `/practice/${lesson.courseId}/${lesson.lessonId}`
                            );
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Continue Lesson
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-gray-600 mb-4">
                      No recent lessons. Start a lesson to see your progress
                      here!
                    </p>
                    <Button
                      className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                      onClick={() => navigate("/courses")}
                    >
                      <List className="w-5 h-5 mr-2" />
                      Browse All Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col space-y-6">
            {/* Browse All Courses Card - Always visible */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Explore More</CardTitle>
                <CardDescription>Discover new learning paths</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => navigate("/courses")}
                >
                  <List className="w-5 h-5 mr-2" />
                  Browse All Courses
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Certificates</CardTitle>
                <CardDescription>View your achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => navigate("/certificates")}
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  View Certificates
                </Button>
              </CardContent>
            </Card>

            {/* Progress to Next Level */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Level Progress</CardTitle>
                <CardDescription>
                  Progress to {getUserLevel(totalPoints + 1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  value={
                    (totalPoints /
                      (currentLevel === "Novice"
                        ? INTERMEDIATE_POINTS_THRESHOLD
                        : currentLevel === "Beginner"
                          ? ADVANCED_POINTS_THRESHOLD
                          : currentLevel === "Intermediate"
                            ? EXPERT_POINTS_THRESHOLD
                            : EXPERT_POINTS_THRESHOLD)) *
                    100
                  }
                  className="w-full mb-2"
                />
                <p className="text-sm text-gray-600">
                  {totalPoints} points (
                  {Math.round(
                    (totalPoints /
                      (currentLevel === "Novice"
                        ? INTERMEDIATE_POINTS_THRESHOLD
                        : currentLevel === "Beginner"
                          ? ADVANCED_POINTS_THRESHOLD
                          : currentLevel === "Intermediate"
                            ? EXPERT_POINTS_THRESHOLD
                            : EXPERT_POINTS_THRESHOLD)) *
                      100
                  )}
                  % to next level)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Keep practicing to reach{" "}
                  {getUserLevel(
                    (currentLevel === "Novice"
                      ? INTERMEDIATE_POINTS_THRESHOLD
                      : currentLevel === "Beginner"
                        ? ADVANCED_POINTS_THRESHOLD
                        : currentLevel === "Intermediate"
                          ? EXPERT_POINTS_THRESHOLD
                          : EXPERT_POINTS_THRESHOLD) -
                      totalPoints +
                      totalPoints
                  )}
                  !
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Completed Lessons */}
        {completedLessonsData && completedLessonsData.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Completed Lessons</CardTitle>
                <CardDescription>Lessons you've mastered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {completedLessonsData.map((lesson) => (
                  <div
                    key={lesson.lessonId}
                    className="relative flex flex-col p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm"
                  >
                    <h3 className="font-semibold text-base text-gray-900 mb-1">
                      {lesson.lessonTitle}
                    </h3>
                    <p className="text-xs text-gray-700 mb-2">
                      From course:{" "}
                      <span className="font-medium">{lesson.courseTitle}</span>
                    </p>

                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <Clock className="w-3 h-3 mr-1 text-gray-500" />
                      <span>
                        Last practiced:{" "}
                        {formatTimestamp(lesson.lastPracticedAt)}
                      </span>
                    </div>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Button
                        variant="outline"
                        className="h-8 text-sm"
                        onClick={() => {
                          navigate(`/course/${lesson.courseId}`);
                        }}
                      >
                        Go to Course
                      </Button>
                      {/* Optionally add a "Review Lesson" button or similar */}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
