import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Progress } from "@/components/ui/progress";
import AppHeader from "@/components/AppHeader";
import AppHeaderRightContent from "@/components/AppHeaderRightContent"; // Import the new component
import { BookOpen, Clock, Star, ArrowLeft, Play, List } from "lucide-react";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const course = useQuery(
    api.courses.getCourse,
    courseId ? { courseId: courseId as Id<"courses"> } : undefined
  );
  const lessons = useQuery(
    api.lessons.getLessonsByCourseId,
    courseId ? { courseId: courseId as Id<"courses"> } : undefined
  );

  const { isSignedIn, isLoaded } = useAuth();

  const allUserProgress = useQuery(
    api.users.listUserProgressForCourse,
    courseId && isSignedIn ? { courseId: courseId as Id<"courses"> } : undefined
  );

  // Ensure all necessary data is loaded before rendering
  if (!isLoaded || !course || lessons === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <AppHeader rightContent={<AppHeaderRightContent />} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/courses")}
          className="mb-6 text-green-600 hover:text-green-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        <Card className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img
                  src={course.imageUrl || "/default.png"}
                  alt={course.title}
                  className="w-full h-auto object-cover rounded-md shadow-md"
                />
              </div>
              <div className="md:w-2/3 flex flex-col justify-between">
                <div className="">
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                    {course.title}
                  </h1>
                  <p className="text-lg text-gray-700 mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700"
                    >
                      {course.level}
                    </Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-5 h-5 fill-current mr-1" />
                      <span className="text-md font-medium">
                        {course.rating}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-1" />
                      <span className="text-md text-nowrap">
                        {course.duration}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="w-5 h-5 mr-1" />
                      <span className="text-md text-nowrap">
                        {lessons?.length || 0} lessons
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {course.skills?.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {isSignedIn && allUserProgress !== undefined && lessons && (
                  <div className="flex items-center text-gray-600">
                    <div className="flex flex-col flex-grow w-full mb-4">
                      <span className="text-md">
                        Course Progress:{" "}
                        {(() => {
                          const totalCourseContent = lessons.reduce(
                            (sum, lesson) =>
                              sum +
                              (lesson.phrases?.reduce(
                                (phraseSum, p) => phraseSum + p.wordCount,
                                0
                              ) || 0) +
                              (lesson.sentences?.reduce(
                                (sentenceSum, s) => sentenceSum + s.wordCount,
                                0
                              ) || 0),
                            0
                          );
                          const completedCourseContent = allUserProgress.reduce(
                            (sum, progress) =>
                              sum + progress.completedContentCount,
                            0
                          );
                          const courseProgressPercentage =
                            totalCourseContent > 0
                              ? (completedCourseContent / totalCourseContent) *
                                100
                              : 0;
                          return `${completedCourseContent}/${totalCourseContent} (${courseProgressPercentage.toFixed(0)}%)`;
                        })()}
                      </span>
                      <Progress
                        value={(() => {
                          const totalCourseContent = lessons.reduce(
                            (sum, lesson) =>
                              sum +
                              (lesson.phrases?.reduce(
                                (phraseSum, p) => phraseSum + p.wordCount,
                                0
                              ) || 0) +
                              (lesson.sentences?.reduce(
                                (sentenceSum, s) => sentenceSum + s.wordCount,
                                0
                              ) || 0),
                            0
                          );
                          const completedCourseContent = allUserProgress.reduce(
                            (sum, progress) =>
                              sum + progress.completedContentCount,
                            0
                          );
                          return totalCourseContent > 0
                            ? (completedCourseContent / totalCourseContent) *
                                100
                            : 0;
                        })()}
                        className="w-full mt-1 h-2 bg-green-200 [&>*]:bg-gradient-to-r [&>*]:from-green-600 [&>*]:to-emerald-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <List className="w-7 h-7 mr-3 text-green-600" />
          Course Lessons
        </h2>
        <div className="space-y-4">
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson, index) => {
              const totalContent =
                (lesson.phrases?.reduce(
                  (phraseSum, p) => phraseSum + p.wordCount,
                  0
                ) || 0) +
                (lesson.sentences?.reduce(
                  (sentenceSum, s) => sentenceSum + s.wordCount,
                  0
                ) || 0);
              const totalLessonPoints = totalContent; // 1 word = 1 point
              const lessonProgress = allUserProgress?.find(
                (p) => p.lessonId === lesson._id
              );
              const completedCount = lessonProgress?.completedContentCount || 0;
              const progressPercentage =
                totalContent > 0 ? (completedCount / totalContent) * 100 : 0;

              return (
                <Card
                  key={lesson._id.toString()}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between md:space-x-8 space-y-4 md:space-y-0">
                    <div className="flex items-center w-full">
                      <span className="text-lg font-semibold text-green-600 mr-4">
                        {index + 1}.
                      </span>
                      <div className="w-full">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {lesson.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {lesson.sentences.length || 0} sentences,{" "}
                          {lesson.phrases.length || 0} phrases,{" "}
                          {totalLessonPoints} total points
                        </p>
                        {isSignedIn && allUserProgress !== undefined && (
                          <div className="text-sm text-gray-500 flex items-center gap-2 w-full">
                            <Progress
                              value={progressPercentage}
                              className="flex-grow mt-1 h-2 bg-green-200 [&>*]:bg-gradient-to-r [&>*]:from-green-600 [&>*]:to-emerald-600"
                            />
                            <div className="text-nowrap">
                              {completedCount}/{totalContent} (
                              {progressPercentage.toFixed(0)}%)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() =>
                        navigate(`/practice/${courseId}/${lesson._id}`)
                      }
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Lesson
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-gray-600 text-center py-8">
              No lessons available for this course yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
