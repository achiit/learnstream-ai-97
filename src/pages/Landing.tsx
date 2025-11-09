import { Component as GradientBarHero } from "@/components/ui/gradient-bar-hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Brain, Video, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All", "Science", "Mathematics", "History", "Literature", 
    "Computer Science", "Economics", "Psychology", "Biology"
  ];

  const learningTopics = [
    {
      category: "Science",
      icon: "🔬",
      title: "Understanding Quantum Mechanics",
      color: "from-blue-400/20 to-blue-500/20",
      illustration: "🌌"
    },
    {
      category: "Mathematics",
      icon: "📐",
      title: "Calculus Made Simple",
      color: "from-purple-400/20 to-purple-500/20",
      illustration: "∫"
    },
    {
      category: "History",
      icon: "📜",
      title: "World War II Overview",
      color: "from-amber-400/20 to-amber-500/20",
      illustration: "🌍"
    },
    {
      category: "Biology",
      icon: "🧬",
      title: "The Human Immune System",
      color: "from-green-400/20 to-green-500/20",
      illustration: "🦠"
    },
    {
      category: "Literature",
      icon: "📚",
      title: "Shakespeare's Sonnets",
      color: "from-rose-400/20 to-rose-500/20",
      illustration: "✍️"
    },
    {
      category: "Computer Science",
      icon: "💻",
      title: "Introduction to Algorithms",
      color: "from-cyan-400/20 to-cyan-500/20",
      illustration: "⚡"
    },
  ];

  const filteredTopics = selectedCategory === "All" 
    ? learningTopics 
    : learningTopics.filter(topic => topic.category === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Bars */}
      <GradientBarHero />

      {/* Learning Topics Section */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Explore Learning Topics
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
            Choose from a wide range of subjects and get personalized learning experiences
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Topic Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTopics.map((topic, index) => (
              <Card 
                key={index}
                className="group overflow-hidden border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{topic.icon}</span>
                    <span className="font-medium text-[#FF8B6D]">{topic.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 min-h-[3.5rem]">
                    {topic.title}
                  </h3>
                </div>
                <div className={`h-48 bg-gradient-to-br ${topic.color} flex items-center justify-center text-6xl`}>
                  {topic.illustration}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How it works
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg max-w-2xl mx-auto">
            Three simple steps to personalized learning
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-gray-100">
              <div className="bg-gradient-to-br from-[#FF8B6D] to-[#FFB29E] w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Upload Your Textbook</h3>
              <p className="text-gray-600 text-lg">
                Simply upload pages from your textbook or type in any topic you want to learn about.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-gray-100">
              <div className="bg-gradient-to-br from-purple-500 to-purple-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Check Your Level</h3>
              <p className="text-gray-600 text-lg">
                Take a quick quiz to assess your current understanding and learning level.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-gray-100">
              <div className="bg-gradient-to-br from-blue-500 to-blue-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Get Custom Video</h3>
              <p className="text-gray-600 text-lg">
                Receive a personalized explainer video tailored to your learning style and level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#FF8B6D] to-[#FF9B7F] rounded-[2.5rem] p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your learning?
            </h2>
            <p className="text-white/95 text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of students already learning smarter with personalized AI videos.
            </p>
            <Button 
              size="lg"
              className="bg-white text-[#FF8B6D] hover:bg-gray-50 text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
