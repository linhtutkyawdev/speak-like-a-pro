import React from "react";
import AppLogo from "./AppLogo"; // Import the logo component

interface AppHeaderProps {
  rightContent: React.ReactNode;
  fullWidth?: boolean; // Optional prop to make the header full width
}

const AppHeader: React.FC<AppHeaderProps> = ({ rightContent, fullWidth }) => {
  const containerClasses = fullWidth
    ? "w-full px-4 sm:px-6 lg:px-8"
    : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className={containerClasses}>
        <div className="flex justify-between items-center h-16">
          <AppLogo />
          <div className="flex items-center space-x-4">{rightContent}</div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
