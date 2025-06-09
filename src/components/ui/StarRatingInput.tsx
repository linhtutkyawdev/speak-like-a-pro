import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxStars?: number;
  size?: number;
  className?: string;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  maxStars = 5,
  size = 28, // Increased default size for bigger stars
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const handleClick = (index: number, isHalf: boolean) => {
    const newRating = index + (isHalf ? 0.5 : 1);
    onChange(newRating);
  };

  const handleMouseMove = (index: number, event: React.MouseEvent) => {
    const starRect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - starRect.left;
    const isHalf = x < starRect.width / 2;
    setHoverValue(index + (isHalf ? 0.5 : 1));
  };

  const handleMouseLeave = () => {
    setHoverValue(undefined);
  };

  const displayValue = hoverValue !== undefined ? hoverValue : value;

  return (
    <div
      className={cn("flex items-center space-x-1", className)} // Added space-x-1 for spacing between stars
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = displayValue >= starValue;
        const isHalfFilled =
          displayValue >= starValue - 0.5 && displayValue < starValue;

        return (
          <div
            key={index}
            className="relative cursor-pointer"
            onMouseMove={(e) => handleMouseMove(index, e)}
            onClick={(e) => {
              const starRect = (
                e.target as HTMLElement
              ).getBoundingClientRect();
              const x = e.clientX - starRect.left;
              const isHalf = x < starRect.width / 2;
              handleClick(index, isHalf);
            }}
          >
            <Star
              size={size}
              className={cn(
                "text-gray-300", // Default empty star color
                isFilled && "text-yellow-400 fill-yellow-400", // Full star color
                isHalfFilled && "text-yellow-400" // Half star outline
              )}
            />
            {isHalfFilled && (
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${size / 2}px` }}
              >
                <Star size={size} className="text-yellow-400 fill-yellow-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarRatingInput;
