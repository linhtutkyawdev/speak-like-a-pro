import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import LandingPage from "./pages/LandingPage";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import SpeakingPractice from "./pages/SpeakingPractice";
import SpeakingPracticeDemo from "./pages/SpeakingPracticeDemo";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import CourseDetails from "./pages/CourseDetails";
import AdminRouteGuard from "./components/AdminRouteGuard";
import AuthRouteGuard from "./components/AuthRouteGuard";
import CertificateView from "./pages/CertificateView";
import CertificateDetailView from "./pages/CertificateDetailView";

const HomeRedirect = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner />; // Or a loading indicator
  }

  if (isSignedIn) {
    return <Dashboard />;
  } else {
    return <LandingPage />;
  }
};
import NotFound from "./pages/NotFound";
import LoadingSpinner from "./components/LoadingSpinner";
const queryClient = new QueryClient();
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
        appearance={{
          variables: {
            colorPrimary: "#10B981", // A shade of green
            colorText: "#1F2937", // Dark gray for text
            colorBackground: "#FFFFFF", // White background
            colorInputBackground: "#F9FAFB", // Light gray for input fields
            colorInputText: "#1F2937", // Dark gray for input text
          },
          elements: {
            formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white",
            socialButtonsBlockButton:
              "bg-gray-100 hover:bg-gray-200 text-gray-700",
            socialButtonsBlockButtonText: "font-semibold",
            footerActionLink: "text-green-600 hover:text-green-700",
          },
        }}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/signin/*" element={<Signin />} />
              <Route path="/signup/*" element={<Signup />} />
              <Route path="/practice-demo" element={<SpeakingPracticeDemo />} />
              <Route path="/admin" element={<AdminRouteGuard />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
              <Route element={<AuthRouteGuard />}>
                <Route
                  path="/practice/:courseId"
                  element={<SpeakingPractice />}
                />
                <Route
                  path="/practice/:courseId/:lessonId"
                  element={<SpeakingPractice />}
                />
                <Route path="/course/:courseId" element={<CourseDetails />} />
                <Route path="/certificates" element={<CertificateView />} />
                <Route
                  path="/certificates/:certificateSlug"
                  element={<CertificateDetailView />}
                />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
