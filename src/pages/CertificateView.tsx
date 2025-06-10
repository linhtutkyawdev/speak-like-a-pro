import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom"; // Added useNavigate
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import LoadingSpinner from "../components/LoadingSpinner";
import AppHeader from "../components/AppHeader";
import AppHeaderRightContent from "../components/AppHeaderRightContent";
import {
  Award,
  Star,
  Target,
  Clock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Certificate {
  title: string;
  description: string;
  icon: React.ElementType;
  criteria: string;
  color: string;
  borderColor: string;
  checkCompletion: (
    totalPoints: number,
    completedLessons: number,
    totalPracticeSeconds: number
  ) => boolean;
}

// Helper function to create a slug from a title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters except spaces and hyphens
    .trim() // Trim leading/trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
};

const certificates: Certificate[] = [
  {
    title: "Beginner Speaker Certificate",
    description: "Awarded for starting your journey in speaking practice.",
    icon: Star,
    criteria: "Achieve 10 Total Points",
    color: "bg-gradient-to-r from-purple-400 to-purple-600",
    borderColor: "border-purple-500",
    checkCompletion: (points) => points >= 10,
  },
  {
    title: "Intermediate Speaker Certificate",
    description:
      "Awarded for successfully completing intermediate speaking challenges.",
    icon: Star,
    criteria: "Achieve 100 Total Points",
    color: "bg-gradient-to-r from-green-400 to-green-600",
    borderColor: "border-green-500",
    checkCompletion: (points) => points >= 100,
  },
  {
    title: "Advanced Speaker Certificate",
    description: "Awarded for demonstrating advanced speaking abilities.",
    icon: Star,
    criteria: "Achieve 500 Total Points",
    color: "bg-gradient-to-r from-blue-400 to-blue-600",
    borderColor: "border-blue-500",
    checkCompletion: (points) => points >= 500,
  },
  {
    title: "Master Speaker Certificate",
    description:
      "Awarded for achieving exceptional proficiency in speaking skills.",
    icon: Star,
    criteria: "Achieve 1000 Total Points",
    color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    borderColor: "border-yellow-500",
    checkCompletion: (points) => points >= 1000,
  },
  {
    title: "Lesson Explorer Certificate",
    description: "Awarded for completing a significant number of lessons.",
    icon: Target,
    criteria: "Complete 10 Lessons",
    color: "bg-gradient-to-r from-red-400 to-red-600",
    borderColor: "border-red-500",
    checkCompletion: (_, completedLessons) => completedLessons >= 10,
  },
  {
    title: "Lesson Master Certificate",
    description: "Awarded for mastering a large number of lessons.",
    icon: Target,
    criteria: "Complete 25 Lessons",
    color: "bg-gradient-to-r from-orange-400 to-orange-600",
    borderColor: "border-orange-500",
    checkCompletion: (_, completedLessons) => completedLessons >= 25,
  },
  {
    title: "Lesson Grandmaster Certificate",
    description: "Awarded for completing almost all available lessons.",
    icon: Target,
    criteria: "Complete 50 Lessons",
    color: "bg-gradient-to-r from-pink-400 to-pink-600",
    borderColor: "border-pink-500",
    checkCompletion: (_, completedLessons) => completedLessons >= 50,
  },
  {
    title: "Time Dedication Certificate (Bronze)",
    description: "Awarded for consistent practice over time.",
    icon: Clock,
    criteria: "Practice for 1 Hour",
    color: "bg-gradient-to-r from-gray-400 to-gray-600",
    borderColor: "border-gray-500",
    checkCompletion: (_, __, practiceTime) => practiceTime >= 3600, // 1 hour in seconds
  },
  {
    title: "Time Dedication Certificate (Silver)",
    description: "Awarded for significant dedication to practice.",
    icon: Clock,
    criteria: "Practice for 5 Hours",
    color: "bg-gradient-to-r from-slate-400 to-slate-600",
    borderColor: "border-slate-500",
    checkCompletion: (_, __, practiceTime) => practiceTime >= 18000, // 5 hours in seconds
  },
  {
    title: "Time Dedication Certificate (Gold)",
    description: "Awarded for exceptional commitment to practice.",
    icon: Clock,
    criteria: "Practice for 10 Hours",
    color: "bg-gradient-to-r from-amber-400 to-amber-600",
    borderColor: "border-amber-500",
    checkCompletion: (_, __, practiceTime) => practiceTime >= 36000, // 10 hours in seconds
  },
];

const CertificateView: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const userProfile = useQuery(
    api.users.getUserProfile,
    userId ? { clerkUserId: userId } : "skip"
  );

  const allUserProgress = useQuery(
    api.users.listAllUserProgress,
    user ? {} : "skip"
  );
  const allLessons = useQuery(api.lessons.listAllLessons);

  if (
    !isUserLoaded ||
    userProfile === undefined ||
    allUserProgress === undefined ||
    allLessons === undefined
  ) {
    return <LoadingSpinner />;
  }

  if (!userProfile) {
    return (
      <div className="text-center text-red-500 p-8">
        User profile not found. Please log in.
      </div>
    );
  }

  const totalPoints = userProfile.totalPoints || 0;

  const completedLessonsCount = allUserProgress?.filter(
    (progress) =>
      progress.completedContentCount >=
      (allLessons?.find((l) => l._id === progress.lessonId)?.phrases?.length ||
        0) +
        (allLessons?.find((l) => l._id === progress.lessonId)?.sentences
          ?.length || 0)
  ).length;

  const totalPracticeSeconds =
    allUserProgress?.reduce(
      (sum, progress) => sum + (progress.practiceDurationSeconds || 0),
      0
    ) || 0;

  const sortedCertificates = [...certificates].sort((a, b) => {
    const aCompleted = a.checkCompletion(
      totalPoints,
      completedLessonsCount,
      totalPracticeSeconds
    );
    const bCompleted = b.checkCompletion(
      totalPoints,
      completedLessonsCount,
      totalPracticeSeconds
    );
    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <AppHeader rightContent={<AppHeaderRightContent />} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-green-600 hover:text-green-800 absolute"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>
        <h1 className="text-5xl font-extrabold text-gray-900 text-center tracking-tight">
          Your Achievements
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {sortedCertificates.map((cert, index) => {
            const isCompleted = cert.checkCompletion(
              totalPoints,
              completedLessonsCount,
              totalPracticeSeconds
            );
            return (
              <Card
                key={index}
                className={`group w-full shadow-xl border-4 ${
                  isCompleted ? cert.borderColor : "border-gray-200"
                } rounded-xl overflow-hidden transform transition-all duration-300 ${
                  isCompleted
                    ? "hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
                    : "opacity-60 grayscale hover:opacity-75"
                } relative`}
                onClick={() =>
                  isCompleted &&
                  navigate(`/certificates/${createSlug(cert.title)}`)
                }
              >
                {isCompleted && (
                  <>
                    <div className="absolute inset-0 bg-pattern-dots opacity-10 z-0"></div>
                    <div className="absolute top-5 right-5 bg-green-500 text-white rounded-full p-2 shadow-xl z-10">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  </>
                )}
                <CardHeader
                  className={`${
                    isCompleted ? cert.color : "bg-gray-100"
                  } text-white p-8 text-center relative z-10`}
                >
                  <div className="absolute inset-0 opacity-20"></div>
                  <cert.icon
                    className={`w-20 h-20 mx-auto mb-4 ${
                      isCompleted
                        ? "text-white drop-shadow-md"
                        : "text-gray-400"
                    } relative z-10`}
                  />
                  <CardTitle
                    className={`text-3xl font-extrabold ${
                      isCompleted ? "text-white" : "text-gray-700"
                    } relative z-10`}
                  >
                    {cert.title}
                  </CardTitle>
                  <p
                    className={`text-md mt-2 opacity-90 ${
                      isCompleted ? "text-white" : "text-gray-500"
                    } relative z-10`}
                  >
                    {cert.description}
                  </p>
                </CardHeader>
                <CardContent className="p-6 bg-white text-center border-t border-gray-100 relative z-10">
                  <div className="text-xl font-semibold text-gray-700 mb-2">
                    Criteria:
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    {cert.criteria}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
