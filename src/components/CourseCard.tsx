import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Star, Play, Lock, CheckCircle } from "lucide-react";

interface CourseCardProps {
  course: {
    _id: any; // Adjust type as per your Convex schema, likely Id<"courses">
    title: string;
    description: string;
    imageUrl?: string;
    level: string;
    rating: number;
    duration: string;
    lessonCount: number;
    skills: string[];
    featured?: boolean;
    totalLessons: number; // Add totalLessons to the course prop
    totalCourseContent: number; // New prop for total content in the course
  };
  userPoints: number; // Current user's total points
  levelPointsThreshold: { [key: string]: number }; // Thresholds for each level
  completedCourseContent: number; // New prop for completed content
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  userPoints,
  levelPointsThreshold,
  completedCourseContent, // Destructure new prop
}) => {
  const navigate = useNavigate();

  const requiredPoints = levelPointsThreshold[course.level] || 0;
  const isLocked = userPoints < requiredPoints;
  const isCompleted =
    course.totalCourseContent > 0 &&
    completedCourseContent === course.totalCourseContent; // Check if all content is completed

  return (
    <Link
      to={isLocked ? "#" : `/course/${course._id}`} // Prevent navigation if locked
      key={course._id.toString()}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault(); // Prevent default link behavior if locked
        }
      }}
    >
      <Card
        className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white ${isLocked ? "opacity-70" : ""}`}
      >
        {course.featured && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            course.imageUrl ? "" : "from-green-500 to-emerald-500"
          }`}
        ></div>

        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-3xl">
              <img
                src={course.imageUrl || "/default.png"}
                alt={course.title}
                className="w-full h-40 object-cover rounded-lg mb-4 border border-gray-200 shadow-sm"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2 group-hover:text-green-700 transition-colors">
            {course.title}
          </h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {course.description}
          </p>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="border-green-200 text-green-700"
              >
                {course.level}
              </Badge>
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-sm font-medium">{course.rating}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {course.duration}
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {course.lessonCount} lessons
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {course.skills.slice(0, 3).map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-green-200 text-green-600"
                >
                  {skill}
                </Badge>
              ))}
              {course.skills.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs border-green-200 text-green-600"
                >
                  +{course.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className={`w-full text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                isLocked
                  ? "bg-gray-400 hover:bg-gray-500 opacity-50 cursor-not-allowed"
                  : isCompleted
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                    : "bg-gradient-to-r from-green-800 to-emerald-800 hover:from-green-900 hover:to-emerald-900"
              }`}
              onClick={() => !isLocked && navigate(`/course/${course._id}`)}
              disabled={isLocked}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Locked ({requiredPoints - userPoints} points needed)
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Course Completed!
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Course
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;
