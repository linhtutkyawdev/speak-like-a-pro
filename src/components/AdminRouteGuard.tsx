import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const AdminRouteGuard = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { userId } = useAuth();
  const userProfile = useQuery(
    api.users.getUserProfile,
    userId ? { clerkUserId: userId } : "skip"
  );

  if (!isLoaded || userProfile === undefined) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  if (
    userProfile &&
    (userProfile.role === "admin" || userProfile.role === "instructor")
  ) {
    return <Outlet />;
  } else {
    return <Navigate to="/not-found" replace />; // Redirect to a not-found or unauthorized page
  }
};

export default AdminRouteGuard;
