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

import AppHeader from "@/components/AppHeader";
import AppHeaderRightContent from "@/components/AppHeaderRightContent";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import LoadingSpinner from "@/components/LoadingSpinner";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoaded: isUserLoaded } = useUser();

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
    if (points >= 10000) {
      return "Advanced";
    } else if (points >= 5000) {
      return "Intermediate";
    } else if (points >= 2000) {
      return "Beginner";
    } else {
      return "Novice"; // Or another appropriate starting level
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Current Level
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentLevel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Points
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPoints}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Lessons Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedLessons}/{totalLessons}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Practice Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPracticeTime(totalPracticeSeconds)}
                  </p>
                </div>
              </div>
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
                  <p className="text-gray-600">
                    No recent lessons. Start a lesson to see your progress here!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/courses")}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Browse All Courses
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/certificates")}
                >
                  <Trophy className="w-4 h-4 mr-2" />
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
                        ? 2000
                        : currentLevel === "Beginner"
                          ? 5000
                          : currentLevel === "Intermediate"
                            ? 10000
                            : 10000)) *
                    100
                  }
                  className="w-full mb-2"
                />
                <p className="text-sm text-gray-600">
                  {totalPoints} points (
                  {Math.round(
                    (totalPoints /
                      (currentLevel === "Novice"
                        ? 2000
                        : currentLevel === "Beginner"
                          ? 5000
                          : currentLevel === "Intermediate"
                            ? 10000
                            : 10000)) *
                      100
                  )}
                  % to next level)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Keep practicing to reach{" "}
                  {getUserLevel(
                    (currentLevel === "Novice"
                      ? 2000
                      : currentLevel === "Beginner"
                        ? 5000
                        : currentLevel === "Intermediate"
                          ? 10000
                          : 10000) -
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
