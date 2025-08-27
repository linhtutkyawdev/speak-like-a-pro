import { SignUp, useAuth } from "@clerk/clerk-react";
import { Link, Navigate } from "react-router-dom";

const Signup = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-subtle-grid flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Link to="/" className="absolute top-4 left-4 text-gray-600 hover:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Link>
      <SignUp routing="path" path="/signup" signInUrl="/signin" />
    </div>
  );
};

export default Signup;
