import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, Settings, User } from "lucide-react";
import { useClerk, useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import LoadingSpinner from "./LoadingSpinner"; // Assuming you have a LoadingSpinner component

const AppHeaderRightContent: React.FC<{ hideUserButton?: boolean }> = ({
  hideUserButton,
}) => {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const userRole = useQuery(
    api.users.getUserRole,
    user ? { clerkUserId: user.id } : "skip"
  );

  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (user && user.id && userRole === null) {
      createUser({
        clerkUserId: user.id,
        role: "student", // Default role for new users
      }).catch((error) => {
        console.error("createUser mutation failed:", error);
      });
    }
  }, [user, userRole, createUser]);

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return <Button onClick={() => navigate("/signin")}>Sign In</Button>;
  }

  return (
    <>
      {(userRole === "admin" || userRole === "instructor") && (
        <Button variant="ghost" onClick={() => navigate("/admin")}>
          <Settings className="w-4 h-4 mr-2" />
          Admin Dashboard
        </Button>
      )}
      {userRole === "admin" && (
        <Button variant="ghost" onClick={() => navigate("/admin/users")}>
          <User className="w-4 h-4 mr-2" />
          User Management
        </Button>
      )}
      <Button variant="ghost" onClick={() => navigate("/courses")}>
        <BookOpen className="w-4 h-4 mr-2" />
        Browse Courses
      </Button>
      {!hideUserButton && <UserButton />}
    </>
  );
};

export default AppHeaderRightContent;
