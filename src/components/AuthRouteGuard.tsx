import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const AuthRouteGuard = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default AuthRouteGuard;
