import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface SpeakingPracticeHeaderProps {
  lessonTitle: string;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  completedContentCount: number;
  totalContentCount: number;
  progress: number;
}

const SpeakingPracticeHeader: React.FC<SpeakingPracticeHeaderProps> = ({
  lessonTitle,
  soundEnabled,
  setSoundEnabled,
  completedContentCount,
  totalContentCount,
  progress,
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="bg-white border-b border-emerald-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Speaking Practice
            </h1>
            <p className="text-sm text-gray-600">{lessonTitle}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Sound Toggle */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sound-toggle" className="text-sm text-gray-600">
                Sound Effects
              </label>
              <input
                type="checkbox"
                id="sound-toggle"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="form-checkbox h-4 w-4 text-emerald-600 transition duration-150 ease-in-out"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {completedContentCount} of {totalContentCount} completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default SpeakingPracticeHeader;
