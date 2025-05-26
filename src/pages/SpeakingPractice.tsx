
import React, { useState } from 'react';
import { Mic, MicOff, Play, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

const SpeakingPractice = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [completedPhrases, setCompletedPhrases] = useState(0);

  // Dummy data for phrases
  const phrases = [
    {
      id: 1,
      text: "Hello, how are you today?",
      level: "Beginner",
      category: "Greetings"
    },
    {
      id: 2,
      text: "I would like to order a coffee, please.",
      level: "Beginner",
      category: "Food & Drinks"
    },
    {
      id: 3,
      text: "Could you help me find the nearest subway station?",
      level: "Intermediate",
      category: "Directions"
    },
    {
      id: 4,
      text: "I'm excited about the upcoming presentation next week.",
      level: "Intermediate",
      category: "Work"
    },
    {
      id: 5,
      text: "The weather forecast suggests it might rain tomorrow.",
      level: "Advanced",
      category: "Weather"
    }
  ];

  const currentPhrase = phrases[currentPhraseIndex];
  const progress = ((completedPhrases) / phrases.length) * 100;

  const handleRecord = () => {
    setIsRecording(!isRecording);
    
    // Simulate recording process
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        // Auto-advance to next phrase after "recording"
        handleNextPhrase();
      }, 3000);
    }
  };

  const handlePlayPhrase = () => {
    // Simulate playing the phrase
    console.log(`Playing phrase: ${currentPhrase.text}`);
  };

  const handleNextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setCompletedPhrases(completedPhrases + 1);
    }
  };

  const handleRetry = () => {
    // Reset recording for current phrase
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Speaking Practice</h1>
            <p className="text-sm text-gray-600">{currentPhrase.level} • {currentPhrase.category}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {completedPhrases} of {phrases.length} completed
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            
            {/* Phrase Display Card */}
            <Card className="border-emerald-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  Practice This Phrase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                  <p className="text-xl text-center text-gray-800 leading-relaxed">
                    "{currentPhrase.text}"
                  </p>
                </div>
                
                <div className="flex justify-center mb-6">
                  <Button
                    variant="outline"
                    onClick={handlePlayPhrase}
                    className="flex items-center space-x-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Play className="h-4 w-4" />
                    <span>Listen to Phrase</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recording Card */}
            <Card className="border-emerald-200">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-gray-900">
                  Record Your Voice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  
                  {/* Recording Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleRecord}
                      size="lg"
                      className={`w-24 h-24 rounded-full ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      } text-white`}
                    >
                      {isRecording ? (
                        <MicOff className="h-8 w-8" />
                      ) : (
                        <Mic className="h-8 w-8" />
                      )}
                    </Button>
                  </div>

                  {/* Recording Status */}
                  <div className="text-center">
                    {isRecording ? (
                      <div>
                        <p className="text-lg font-semibold text-red-600 mb-2">Recording...</p>
                        <p className="text-sm text-gray-600">Speak the phrase clearly</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-semibold text-gray-800 mb-2">Ready to Record</p>
                        <p className="text-sm text-gray-600">Click the microphone to start</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleRetry}
                      disabled={isRecording}
                      className="flex items-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Try Again</span>
                    </Button>
                    
                    {currentPhraseIndex < phrases.length - 1 ? (
                      <Button
                        onClick={handleNextPhrase}
                        disabled={isRecording}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Next Phrase
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/')}
                        disabled={isRecording}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Complete Session
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">💡 Speaking Tips:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Speak clearly and at a natural pace</li>
                  <li>• Try to match the pronunciation you heard</li>
                  <li>• Don't worry about perfection - practice makes progress!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingPractice;
