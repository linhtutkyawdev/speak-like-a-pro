import React from "react";
import AppLogo from "./AppLogo"; // Import the logo component
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/clerk-react"; // Import UserButton

interface AppHeaderProps {
  rightContent: React.ReactNode;
  fullWidth?: boolean; // Optional prop to make the header full width
}

const AppHeader: React.FC<AppHeaderProps> = ({ rightContent, fullWidth }) => {
  const isMobile = useIsMobile();
  const containerClasses = fullWidth
    ? "w-full px-4 sm:px-6 lg:px-8"
    : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className={containerClasses}>
        <div className="flex justify-between items-center h-16">
          <AppLogo />
          {isMobile ? (
            <div className="flex items-center space-x-4">
              <UserButton /> {/* Render UserButton directly on mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-3/4 sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col items-start space-y-4 pt-8">
                    {/* Pass hideUserButton to prevent duplicate rendering */}
                    {React.cloneElement(rightContent as React.ReactElement, {
                      hideUserButton: true,
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center space-x-4">{rightContent}</div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
