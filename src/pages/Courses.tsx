import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/LoadingSpinner";
import CourseCard from "@/components/CourseCard";
import AppHeader from "@/components/AppHeader";
import AppHeaderRightContent from "@/components/AppHeaderRightContent"; // Import the new component
import StarRatingInput from "@/components/ui/StarRatingInput"; // Import StarRatingInput
import {
  BEGINNER_POINTS_THRESHOLD,
  INTERMEDIATE_POINTS_THRESHOLD,
  ADVANCED_POINTS_THRESHOLD,
} from "@/lib/constants";
import {
  BookOpen, // Still needed for academic category icon
  Star, // Still needed for featured courses section
  Search,
  Trophy,
  Briefcase,
  Coffee,
  Globe,
  Zap,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react"; // Import useAuth

// Custom hook for debouncing a value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Courses = () => {
  const navigate = useNavigate();
  const { userId } = useAuth(); // Get the current user's ID
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 800); // Debounce search term by 800ms
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // New state for skills
  const [selectedRating, setSelectedRating] = useState<number>(0); // New state for rating (0 means no filter)

  // Define point thresholds for course levels
  const LEVEL_POINTS_THRESHOLD: { [key: string]: number } = {
    beginner: BEGINNER_POINTS_THRESHOLD, // No points needed for beginner
    intermediate: INTERMEDIATE_POINTS_THRESHOLD,
    advanced: ADVANCED_POINTS_THRESHOLD,
  };

  const categories = [
    {
      id: "all",
      name: "All Courses",
      icon: Globe,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "business",
      name: "Business",
      icon: Briefcase,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "daily",
      name: "Daily Life",
      icon: Coffee,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "academic",
      name: "Academic",
      icon: BookOpen,
      color: "from-green-500 to-teal-500",
    },
    {
      id: "travel",
      name: "Travel",
      icon: Globe,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const levels = [
    { id: "all", name: "All Levels", color: "from-green-500 to-emerald-500" },
    { id: "beginner", name: "Beginner", color: "from-green-500 to-blue-500" },
    {
      id: "intermediate",
      name: "Intermediate",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "advanced",
      name: "Advanced",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const courses = useQuery(api.courses.getCourses, {
    level: selectedLevel === "all" ? undefined : selectedLevel,
    searchTerm: debouncedSearchTerm === "" ? undefined : debouncedSearchTerm,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined, // Pass selected skills
    minRating: selectedRating > 0 ? selectedRating : undefined, // Pass selected rating
  });

  const allUserProgress = useQuery(
    api.users.listAllUserProgress,
    userId ? {} : "skip"
  );

  // Fetch user profile to get totalPoints
  const userProfile = useQuery(
    api.users.getUserProfile,
    userId ? { clerkUserId: userId } : "skip"
  );

  // Handle loading state for courses and user profile
  if (!courses || (userId && !userProfile)) {
    return <LoadingSpinner />;
  }

  // Dynamically extract all unique skills from courses data after courses are loaded
  const allSkills = Array.from(
    new Set(courses.flatMap((course) => course.skills))
  ).sort(); // Sort skills alphabetically

  const filteredCourses = courses || [];

  // Define a custom sort order for levels
  const levelOrder: { [key: string]: number } = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };

  // Sort courses by level (low to high)
  filteredCourses.sort((a, b) => {
    const orderA = levelOrder[a.level] || 99; // Assign a high number for unknown levels
    const orderB = levelOrder[b.level] || 99;
    return orderA - orderB;
  });

  const featuredCourses = courses.filter((course) => course.featured) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <AppHeader rightContent={<AppHeaderRightContent />} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <h1 className="text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Explore Amazing Courses
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our collection of interactive English speaking courses
              designed to boost your confidence
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 border-green-200 focus:border-green-500 rounded-xl w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} border-0 text-white`
                      : "border-2 border-green-200 hover:border-green-400"
                  }`}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Level Filter */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              <span className="text-gray-600 font-medium py-2">
                Filter by Level:
              </span>
              {levels.map((level) => (
                <Button
                  key={level.id}
                  variant={selectedLevel === level.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(level.id)}
                  className={`whitespace-nowrap ${
                    selectedLevel === level.id
                      ? `bg-gradient-to-r ${level.color} border-0 text-white`
                      : "border-2 border-green-200 hover:border-green-400"
                  }`}
                >
                  {level.name}
                </Button>
              ))}
            </div>

            {/* Rating Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-gray-600 font-medium py-2">
                Filter by Minimum Rating:
              </span>
              <StarRatingInput
                value={selectedRating}
                onChange={setSelectedRating}
                maxStars={5}
                size={24}
              />
              {selectedRating > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRating(0)}
                  className="text-red-500 hover:text-red-700"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Skills Filter */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 mt-4">
            <span className="text-gray-600 font-medium py-2">
              Filter by Skills:
            </span>
            {allSkills.map((skill) => (
              <Button
                key={skill}
                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                size="sm"
                onClick={() => handleSkillToggle(skill)}
                className={`whitespace-nowrap ${
                  selectedSkills.includes(skill)
                    ? `bg-gradient-to-r from-purple-500 to-indigo-500 border-0 text-white`
                    : "border-2 border-gray-200 hover:border-gray-400"
                }`}
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Courses */}
        {selectedCategory === "all" && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-green-500 mr-2" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-green-pulse">
                Featured Courses
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => {
                const completedCourseContent =
                  allUserProgress?.reduce((sum, progress) => {
                    if (progress.courseId === course._id) {
                      return sum + progress.completedContentCount;
                    }
                    return sum;
                  }, 0) || 0;

                return (
                  <CourseCard
                    key={course._id.toString()}
                    course={{
                      ...course,
                      totalLessons: course.lessonCount,
                      totalCourseContent: course.totalCourseContent,
                    }}
                    userPoints={userProfile?.totalPoints || 0}
                    levelPointsThreshold={LEVEL_POINTS_THRESHOLD}
                    completedCourseContent={completedCourseContent}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* All Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              {selectedCategory === "all"
                ? "All Courses"
                : `${categories.find((c) => c.id === selectedCategory)?.name} Courses`}
            </h2>
            <div className="text-gray-500">
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""} found
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                const completedCourseContent =
                  allUserProgress?.reduce((sum, progress) => {
                    if (progress.courseId === course._id) {
                      return sum + progress.completedContentCount;
                    }
                    return sum;
                  }, 0) || 0;
                return (
                  <CourseCard
                    key={course._id.toString()}
                    course={{
                      ...course,
                      totalLessons: course.lessonCount,
                      totalCourseContent: course.totalCourseContent,
                    }}
                    userPoints={userProfile?.totalPoints || 0}
                    levelPointsThreshold={LEVEL_POINTS_THRESHOLD}
                    completedCourseContent={completedCourseContent}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">
                No courses found matching your criteria.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search term or filters.
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardContent className="p-12 relative z-10">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of learners who have transformed their English
                speaking skills
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-800 to-emerald-800 text-white hover:from-green-900 hover:to-emerald-900 hover:shadow-lg transform hover:scale-105 transition-all duration-200 px-8 py-3"
                onClick={() => navigate("/practice")}
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Learning Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Courses;
