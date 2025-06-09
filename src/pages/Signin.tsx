import { SignIn, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const Signin = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-subtle-grid flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SignIn routing="path" path="/signin" signUpUrl="/signup" />
    </div>
  );
};

export default Signin;
