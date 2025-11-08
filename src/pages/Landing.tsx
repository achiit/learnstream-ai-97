import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { Upload, Brain, Video, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-gradient-warm rounded-full text-primary-foreground text-sm font-medium mb-4 shadow-glow animate-fade-in">
            AI-Powered Personalized Learning
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in">
            Learn any concept
            <span className="block mt-2 bg-gradient-warm bg-clip-text text-transparent">
              your way
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Upload your textbook pages or describe any topic. Get custom educational videos 
            tailored to your learning level.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in">
            <Button 
              size="lg" 
              className="bg-gradient-warm hover:opacity-90 transition-opacity shadow-glow text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              Try Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-soft">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How it works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps to personalized learning
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Upload}
              title="Upload Your Textbook"
              description="Simply upload pages from your textbook or type in any topic you want to learn about."
            />
            <FeatureCard
              icon={Brain}
              title="Check Your Level"
              description="Take a quick quiz to assess your current understanding and learning level."
            />
            <FeatureCard
              icon={Video}
              title="Get Custom Video"
              description="Receive a personalized explainer video tailored to your learning style and level."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-accent rounded-3xl p-12 text-center shadow-large">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your learning?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning smarter with personalized AI videos.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={() => navigate("/auth")}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
