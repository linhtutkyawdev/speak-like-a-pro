
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { LogOut, Play, Trophy, Target, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mockStats = {
    totalLessons: 24,
    completedLessons: 8,
    currentStreak: 5,
    totalPracticeTime: 240, // minutes
    currentLevel: 'Intermediate',
    nextMilestone: 'Advanced'
  };

  const recentCourses = [
    { id: 1, title: 'Business English', progress: 75, level: 'Intermediate' },
    { id: 2, title: 'Daily Conversations', progress: 60, level: 'Beginner' },
    { id: 3, title: 'Pronunciation Master', progress: 30, level: 'Advanced' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Speak Like a Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/courses')}>
                Browse Courses
              </Button>
              <span className="text-gray-700">Welcome back, {user?.name}!</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Level</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.currentLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockStats.completedLessons}/{mockStats.totalLessons}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Practice Time</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalPracticeTime}m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">{mockStats.currentStreak}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Day Streak</p>
                  <p className="text-2xl font-bold text-gray-900">Keep it up!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-medium text-gray-900 mr-2">{course.title}</h3>
                        <Badge variant="secondary">{course.level}</Badge>
                      </div>
                      <Progress value={course.progress} className="w-full" />
                      <p className="text-sm text-gray-600 mt-1">{course.progress}% complete</p>
                    </div>
                    <Button size="sm" className="ml-4 bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Continue
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => navigate('/practice')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Speaking Practice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/courses')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Browse All Courses
                </Button>
                <Button variant="outline" className="w-full">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Achievements
                </Button>
              </CardContent>
            </Card>

            {/* Progress to Next Level */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Level Progress</CardTitle>
                <CardDescription>
                  Progress to {mockStats.nextMilestone}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={65} className="w-full mb-2" />
                <p className="text-sm text-gray-600">65% to next level</p>
                <p className="text-xs text-gray-500 mt-1">
                  Complete 6 more lessons to advance!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
