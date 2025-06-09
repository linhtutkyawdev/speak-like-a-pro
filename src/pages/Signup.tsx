import { SignUp, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const Signup = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-subtle-grid flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SignUp routing="path" path="/signup" signInUrl="/signin" />
    </div>
  );
};

export default Signup;
