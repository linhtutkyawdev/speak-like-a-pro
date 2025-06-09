import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Settings, User } from "lucide-react";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const AppHeaderRightContent: React.FC = () => {
  const { signOut } = useClerk();
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

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
      <UserButton />
    </>
  );
};

export default AppHeaderRightContent;
