import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-react"; // Import useUser
import { Star, Target, Clock, ArrowLeft } from "lucide-react";
import AppHeader from "../components/AppHeader";
import AppHeaderRightContent from "../components/AppHeaderRightContent";
import { Button } from "../components/ui/button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ui/use-toast";

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

// This array should ideally be fetched from a central source or passed as props
// to ensure consistency with CertificateView.tsx
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

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const CertificateDetailView: React.FC = () => {
  const { certificateSlug } = useParams<{ certificateSlug: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser(); // Get user object from Clerk

  const userProfile = useQuery(
    api.users.getUserProfile,
    userId ? { clerkUserId: userId } : "skip"
  );

  const allUserProgress = useQuery(
    api.users.listAllUserProgress,
    user ? {} : "skip"
  );
  const allLessons = useQuery(api.lessons.listAllLessons);

  const certificate = certificates.find(
    (cert) => createSlug(cert.title) === certificateSlug
  );

  if (
    !isUserLoaded ||
    userProfile === undefined ||
    allUserProgress === undefined ||
    allLessons === undefined
  ) {
    return <LoadingSpinner />;
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-center">
        <AppHeader rightContent={<AppHeaderRightContent />} />
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Certificate Not Found
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            The certificate you are looking for does not exist.
          </p>
          <Button onClick={() => navigate("/certificates")}>
            Back to Certificates
          </Button>
        </div>
      </div>
    );
  }

  const totalPoints = userProfile?.totalPoints || 0;

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

  const isCompleted = certificate.checkCompletion(
    totalPoints,
    completedLessonsCount,
    totalPracticeSeconds
  );

  const IconComponent = certificate.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <AppHeader rightContent={<AppHeaderRightContent />} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/certificates")}
          className="mb-6 text-green-600 hover:text-green-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to certificates
        </Button>
        <div
          className={`bg-white rounded-xl shadow-2xl overflow-hidden border-4 max-w-4xl mx-auto ${
            isCompleted
              ? certificate.borderColor
              : "border-gray-200 opacity-60 grayscale"
          } p-8`}
        >
          <div
            className={`${
              isCompleted ? certificate.color : "bg-gray-100"
            } text-white p-8 text-center relative rounded-lg mb-8`}
          >
            <IconComponent
              className={`w-28 h-28 mx-auto mb-6 ${
                isCompleted ? "text-white drop-shadow-lg" : "text-gray-400"
              }`}
            />
            <h1
              className={`text-5xl font-extrabold mb-4 tracking-tight ${
                isCompleted ? "text-white" : "text-gray-700"
              }`}
            >
              {certificate.title}
            </h1>
            {user?.fullName && (
              <p
                className={`text-xl font-semibold mt-4 ${
                  isCompleted ? "text-white" : "text-gray-500"
                }`}
              >
                Awarded to: {user.fullName}
              </p>
            )}
            <p
              className={`text-lg opacity-90 max-w-2xl mx-auto ${
                isCompleted ? "text-white" : "text-gray-500"
              }`}
            >
              {certificate.description}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800 mb-4">
              Completion Criteria:
            </div>
            <p className="text-xl text-gray-700 font-medium mb-10">
              {certificate.criteria}
            </p>
            {isCompleted ? (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                <p className="text-lg font-semibold">
                  Congratulations! You have earned this certificate.
                </p>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
                <p className="text-lg font-semibold">
                  You have not yet completed this certificate. Keep practicing!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailView;
