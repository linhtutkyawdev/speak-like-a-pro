import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const AdminRouteGuard = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { userId } = useAuth();
  const userProfile = useQuery(
    api.users.getUserProfile,
    userId ? { clerkUserId: userId } : "skip"
  );
  const location = useLocation();

  if (!isLoaded || userProfile === undefined) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  const isAdmin = userProfile?.role === "admin";
  const isInstructor = userProfile?.role === "instructor";
  const isStudent = userProfile?.role === "student";

  if (location.pathname === "/admin/users") {
    if (isAdmin) {
      return <Outlet />;
    } else {
      return <Navigate to="/not-found" replace />;
    }
  } else if (location.pathname === "/admin") {
    if (isAdmin || isInstructor) {
      return <Outlet />;
    } else {
      return <Navigate to="/not-found" replace />;
    }
  }

  // Fallback for any other /admin sub-routes not explicitly handled,
  // assuming they should follow the /admin rule (admin or instructor)
  if (location.pathname.startsWith("/admin/")) {
    if (isAdmin || isInstructor) {
      return <Outlet />;
    } else {
      return <Navigate to="/not-found" replace />;
    }
  }

  // If somehow reached here without matching any admin path, redirect
  return <Navigate to="/not-found" replace />;
};

export default AdminRouteGuard;
