
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Search, 
  Filter,
  Play,
  Trophy,
  Target,
  Briefcase,
  Coffee,
  Globe,
  Heart,
  Zap,
  Award,
  TrendingUp,
  Mic,
  Volume2,
  ArrowRight
} from 'lucide-react';

const Courses = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const categories = [
    { id: 'all', name: 'All Courses', icon: Globe, color: 'from-purple-500 to-pink-500' },
    { id: 'business', name: 'Business', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { id: 'daily', name: 'Daily Life', icon: Coffee, color: 'from-orange-500 to-red-500' },
    { id: 'academic', name: 'Academic', icon: BookOpen, color: 'from-green-500 to-teal-500' },
    { id: 'travel', name: 'Travel', icon: Globe, color: 'from-indigo-500 to-purple-500' }
  ];

  const courses = [
    {
      id: 1,
      title: "Business English Mastery",
      description: "Master professional communication for the workplace",
      category: 'business',
      level: 'Intermediate',
      duration: '8 weeks',
      lessons: 24,
      completedLessons: 8,
      rating: 4.9,
      students: 12500,
      price: 'Premium',
      thumbnail: '💼',
      skills: ['Presentations', 'Meetings', 'Negotiations', 'Email Writing'],
      instructor: 'Dr. Sarah Johnson',
      featured: true,
      progress: 33,
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 2,
      title: "Everyday Conversations",
      description: "Build confidence in daily English interactions",
      category: 'daily',
      level: 'Beginner',
      duration: '6 weeks',
      lessons: 18,
      completedLessons: 12,
      rating: 4.8,
      students: 8900,
      price: 'Free',
      thumbnail: '☕',
      skills: ['Small Talk', 'Shopping', 'Restaurant', 'Transport'],
      instructor: 'Mark Williams',
      featured: false,
      progress: 67,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 3,
      title: "IELTS Speaking Preparation",
      description: "Achieve your target IELTS speaking score",
      category: 'academic',
      level: 'Advanced',
      duration: '10 weeks',
      lessons: 30,
      completedLessons: 5,
      rating: 4.9,
      students: 15600,
      price: 'Premium',
      thumbnail: '🎓',
      skills: ['Test Strategy', 'Fluency', 'Vocabulary', 'Pronunciation'],
      instructor: 'Prof. Emma Chen',
      featured: true,
      progress: 17,
      color: 'from-green-600 to-emerald-700'
    },
    {
      id: 4,
      title: "Travel English Adventure",
      description: "Navigate the world with confident English",
      category: 'travel',
      level: 'Intermediate',
      duration: '4 weeks',
      lessons: 12,
      completedLessons: 0,
      rating: 4.7,
      students: 6700,
      price: 'Premium',
      thumbnail: '✈️',
      skills: ['Airport', 'Hotel', 'Directions', 'Emergency'],
      instructor: 'Alex Thompson',
      featured: false,
      progress: 0,
      color: 'from-purple-600 to-indigo-700'
    },
    {
      id: 5,
      title: "Pronunciation Perfection",
      description: "Master American English pronunciation",
      category: 'daily',
      level: 'All Levels',
      duration: '12 weeks',
      lessons: 36,
      completedLessons: 15,
      rating: 4.9,
      students: 9800,
      price: 'Premium',
      thumbnail: '🎤',
      skills: ['Phonetics', 'Accent Training', 'Rhythm', 'Intonation'],
      instructor: 'Dr. Lisa Rodriguez',
      featured: true,
      progress: 42,
      color: 'from-pink-600 to-rose-700'
    },
    {
      id: 6,
      title: "Job Interview English",
      description: "Land your dream job with perfect interview skills",
      category: 'business',
      level: 'Intermediate',
      duration: '3 weeks',
      lessons: 9,
      completedLessons: 9,
      rating: 4.8,
      students: 5400,
      price: 'Free',
      thumbnail: '💡',
      skills: ['Interview Questions', 'Body Language', 'Confidence', 'Follow-up'],
      instructor: 'Michael Davis',
      featured: false,
      progress: 100,
      color: 'from-cyan-600 to-blue-700'
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredCourses = courses.filter(course => course.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="relative">
                <Mic className="h-8 w-8 text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text" />
                <div className="absolute inset-0 h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Speak Like a Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <span className="text-gray-700">Hi, {user?.name}!</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <h1 className="text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Explore Amazing Courses
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our collection of interactive English speaking courses designed to boost your confidence
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 border-purple-200 focus:border-purple-500 rounded-xl"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} border-0 text-white`
                      : 'border-2 border-purple-200 hover:border-purple-400'
                  }`}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Courses */}
        {selectedCategory === 'all' && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Featured Courses
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="text-4xl mb-4 text-center">{course.thumbnail}</div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">{course.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {course.level}
                      </Badge>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>

                    {course.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.lessons} lessons
                      </div>
                    </div>

                    <Button 
                      className={`w-full bg-gradient-to-r ${course.color} hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                      onClick={() => navigate('/practice')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {course.progress > 0 ? 'Continue' : 'Start Course'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {selectedCategory === 'all' ? 'All Courses' : `${categories.find(c => c.id === selectedCategory)?.name} Courses`}
            </h2>
            <div className="text-gray-500">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${course.color}`}></div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-3xl">{course.thumbnail}</div>
                    <div className="text-right">
                      <Badge 
                        variant={course.price === 'Free' ? 'default' : 'secondary'}
                        className={course.price === 'Free' ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-100 text-purple-700'}
                      >
                        {course.price}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-700 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{course.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-purple-200 text-purple-700">
                        {course.level}
                      </Badge>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-gray-400 text-xs ml-1">({course.students.toLocaleString()})</span>
                      </div>
                    </div>

                    {course.progress > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Your Progress</span>
                          <span className="font-medium">{course.completedLessons}/{course.lessons} lessons</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.students.toLocaleString()} students
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-200 text-gray-600">
                          {skill}
                        </Badge>
                      ))}
                      {course.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                          +{course.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className={`w-full bg-gradient-to-r ${course.color} hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                      onClick={() => navigate('/practice')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                    <div className="text-center text-xs text-gray-500">
                      Instructor: {course.instructor}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardContent className="p-12 relative z-10">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of learners who have transformed their English speaking skills
              </p>
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-200 px-8 py-3"
                onClick={() => navigate('/practice')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Learning Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Courses;
