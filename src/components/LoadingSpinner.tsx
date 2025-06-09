import React from "react";
// import { Mic } from "lucide-react"; // Assuming lucide-react is available for icons

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-subtle-grid">
      <div className="relative inline-flex">
        {/* Outer pulsing circle */}
        <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-75 animate-scale-up-down"></div>
        {/* Inner circle with text */}
        <div className="w-20 h-20 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg">
          {/* Speak text */}
          <span className="text-green-700 font-extrabold text-xl">Speak</span>
        </div>
        {/* Smaller circles with "Like", "a", "Pro" */}
        <div className="absolute -top-1/4 -left-1/4 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-800 animate-bounce-subtle delay-200">
          Like
        </div>
        <div className="absolute -top-1/4 -right-1/4 w-8 h-8 bg-red-400 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce-subtle delay-400">
          a
        </div>
        <div className="absolute -bottom-1/4 -right-[50%] w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-base font-bold text-white animate-bounce-subtle delay-600">
          Pro
        </div>
      </div>
      <p className="mt-8 text-gray-700 text-lg font-semibold animate-fade-in">
        Preparing your speaking journey...
      </p>
    </div>
  );
};

export default LoadingSpinner;
