import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  BookOpen,
  Target,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Trophy,
  TrendingUp,
  Sparkles,
  Zap,
  Award,
  Globe,
  Briefcase,
  Coffee,
  GraduationCap,
} from "lucide-react";

import AppHeader from "@/components/AppHeader";
const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      name: "AI-Powered Feedback",
      description: "Get instant feedback on your pronunciation and grammar.",
      icon: Star,
    },
    {
      name: "Real-World Scenarios",
      description: "Practice conversations in realistic situations.",
      icon: Users,
    },
    {
      name: "Personalized Learning",
      description: "Tailored lessons to match your skill level and goals.",
      icon: Target,
    },
    {
      name: "Progress Tracking",
      description: "Monitor your improvement and celebrate milestones.",
      icon: TrendingUp,
    },
  ];

  const learningPaths = [
    {
      name: "Beginner Explorer",
      description:
        "Start your English journey with confidence. Perfect for absolute beginners ready to take their first steps.",
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
      accentColor: "from-emerald-100 to-teal-100",
      courses: 12,
      duration: "3 months",
      skills: ["Basic Grammar", "Essential Vocabulary", "Simple Conversations"],
      emoji: "🌱",
    },
    {
      name: "Intermediate Achiever",
      description:
        "Enhance your fluency and expand your vocabulary. Build on your foundation with real-world practice.",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
      accentColor: "from-blue-100 to-indigo-100",
      courses: 18,
      duration: "4 months",
      skills: ["Complex Grammar", "Business English", "Cultural Context"],
      emoji: "🚀",
    },
    {
      name: "Advanced Master",
      description:
        "Master complex topics and refine your communication skills. Achieve native-level fluency and confidence.",
      icon: Trophy,
      color: "from-purple-500 to-pink-600",
      accentColor: "from-purple-100 to-pink-100",
      courses: 24,
      duration: "6 months",
      skills: [
        "Advanced Grammar",
        "Professional Communication",
        "Native Expressions",
      ],
      emoji: "👑",
    },
  ];

  const specializedCourses = [
    {
      name: "Business Professional",
      description: "Master workplace communication and advance your career",
      icon: Briefcase,
      color: "from-slate-600 to-slate-800",
      students: "15k+",
      rating: 4.9,
    },
    {
      name: "Travel Explorer",
      description: "Navigate the world with confident English speaking",
      icon: Globe,
      color: "from-cyan-500 to-blue-600",
      students: "8k+",
      rating: 4.8,
    },
    {
      name: "Daily Conversations",
      description: "Excel in everyday interactions and social situations",
      icon: Coffee,
      color: "from-orange-500 to-red-600",
      students: "12k+",
      rating: 4.7,
    },
    {
      name: "Academic Excellence",
      description: "Prepare for IELTS, TOEFL and university success",
      icon: GraduationCap,
      color: "from-green-600 to-emerald-700",
      students: "20k+",
      rating: 4.9,
    },
  ];

  const testimonials = [
    {
      name: "Alice Johnson",
      quote:
        "I've improved my English speaking skills so much with this platform. The AI feedback is incredibly helpful!",
    },
    {
      name: "Bob Williams",
      quote:
        "The real-world scenarios made learning fun and practical. I feel much more confident in my conversations.",
    },
  ];

  const stats = [
    {
      label: "Happy Learners",
      value: "10,000+",
    },
    {
      label: "Hours of Practice",
      value: "5,000+",
    },
    {
      label: "Lessons Completed",
      value: "20,000+",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-100">
      <AppHeader
        fullWidth={true}
        rightContent={
          <>
            <Button variant="ghost" onClick={() => navigate("/signin")}>
              Sign In
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </>
        }
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 hover:from-green-200 hover:to-emerald-200 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                🎯 Your Path to Confident English Speaking
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
              <span className="block">Speak Like a</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent relative">
                Pro
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-transparent to-pink-600 animate-pulse-and-spin blur-2xl rounded-full"></div>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Master English speaking with our AI-powered platform. Practice
              real conversations, get instant feedback, and build confidence one
              phrase at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => navigate("/signup")}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Speaking Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 h-auto border-2 border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => navigate("/practice")}
              >
                <Mic className="mr-2 h-5 w-5" />
                Try Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths - Beautiful Creative Cards */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
              <Target className="w-4 h-4 mr-2" />
              Choose Your Adventure
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Learning Journey
              </span>{" "}
              Awaits
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every expert was once a beginner. Choose your path and let us
              guide you to English mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {learningPaths.map((path, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                ></div>

                {/* Accent Border */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${path.color}`}
                ></div>

                {/* Floating Elements */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${path.accentColor} rounded-full blur-xl`}
                  ></div>
                </div>

                <CardContent className="p-8 relative z-10">
                  {/* Icon and Emoji */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${path.accentColor} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <path.icon
                        className={`h-8 w-8 bg-gradient-to-br ${path.color} bg-clip-text text-transparent`}
                      />
                    </div>
                    <div className="text-3xl group-hover:scale-125 transition-transform duration-300">
                      {path.emoji}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                    {path.name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {path.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold bg-gradient-to-r ${path.color} bg-clip-text text-transparent`}
                      >
                        {path.courses}
                      </div>
                      <div className="text-sm text-gray-500">Courses</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold bg-gradient-to-r ${path.color} bg-clip-text text-transparent`}
                      >
                        {path.duration}
                      </div>
                      <div className="text-sm text-gray-500">Duration</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      You'll Master:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill, skillIndex) => (
                        <Badge
                          key={skillIndex}
                          variant="outline"
                          className="text-xs border-gray-200 text-gray-600 hover:border-purple-300 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${path.color} hover:shadow-lg transform hover:scale-105 transition-all duration-300 group-hover:shadow-2xl`}
                    onClick={() => navigate("/signup")}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Start Your Journey
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Browse All Courses Button */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 px-8 py-3"
              onClick={() => navigate("/courses")}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Specialized Courses */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200">
              <Award className="w-4 h-4 mr-2" />
              Specialized Training
            </Badge>
            <h2 className="text-3xl font-semibold text-gray-900">
              Master{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Specific Skills
              </span>
            </h2>
            <p className="text-gray-600 mt-2">
              Targeted courses for your unique goals and interests.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializedCourses.map((course, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-white"
              >
                <CardContent className="p-6">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${course.color} mb-4 w-fit group-hover:scale-110 transition-transform duration-300`}
                  >
                    <course.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {course.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {course.rating}
                    </div>
                  </div>
                  <Button
                    className={`w-full bg-gradient-to-r ${course.color} hover:shadow-md transition-all duration-200`}
                    size="sm"
                    onClick={() => navigate("/signup")}
                  >
                    Explore Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900">
              Unlock Your Speaking Potential
            </h2>
            <p className="text-gray-600 mt-2">
              Explore the features that make our platform unique.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <feature.icon className="h-6 w-6 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900">
              What Our Learners Say
            </h2>
            <p className="text-gray-600 mt-2">
              Read inspiring stories from people who have transformed their
              speaking skills.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <p className="text-gray-700 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <div className="text-gray-900 font-semibold">
                    - {testimonial.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-green-600">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold mb-8">
            Ready to Speak Like a Pro?
          </h2>
          <p className="text-xl mb-12">
            Join our community of learners and start your journey to confident
            English speaking today.
          </p>
          <Button
            size="lg"
            className="bg-white text-green-700 hover:bg-green-50 hover:shadow-lg transition-shadow duration-300 px-8 py-3 h-auto text-lg"
            onClick={() => navigate("/signin")}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-50 py-8 border-t border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} Speak Like a Pro. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
