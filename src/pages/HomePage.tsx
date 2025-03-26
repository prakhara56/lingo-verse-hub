
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  FileText, 
  Image, 
  Code, 
  Music, 
  ArrowRight,
  BarChart,
  FileEdit,
  Youtube,
} from 'lucide-react';

const appCards = [
  {
    title: "AI Chat Hub",
    description: "Chat with AI models, generate text, images, code, and transcribe audio",
    icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
    path: "/chat"
  },
  {
    title: "Stock Analyzer",
    description: "Get detailed analysis reports on stocks and market trends",
    icon: <BarChart className="h-8 w-8 text-green-500" />,
    path: "/stock-analyzer"
  },
  {
    title: "Blog Generator",
    description: "Create and publish technical blog posts on any topic",
    icon: <FileEdit className="h-8 w-8 text-purple-500" />,
    path: "/blog-generator"
  },
  {
    title: "CineNotes",
    description: "Generate detailed notes from YouTube videos or uploaded content",
    icon: <Youtube className="h-8 w-8 text-red-500" />,
    path: "/cine-notes"
  }
];

const featureCards = [
  {
    title: "Text Generation",
    description: "Generate creative writing, summaries, translations & more",
    icon: <FileText className="h-6 w-6 text-indigo-500" />,
  },
  {
    title: "Image Generation",
    description: "Create beautiful images from text descriptions",
    icon: <Image className="h-6 w-6 text-pink-500" />,
  },
  {
    title: "Code Assistant",
    description: "Get help with coding, debugging and code explanations",
    icon: <Code className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: "Audio Transcription",
    description: "Convert speech to text with high accuracy",
    icon: <Music className="h-6 w-6 text-emerald-500" />,
  }
];

const HomePage = () => {
  return (
    <MainLayout>
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              AI Craftworks Hub
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your gateway to multiple AI applications in one elegant interface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {appCards.map((card, index) => (
            <Card key={index} className="hover-scale overflow-hidden border border-border/50 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="mb-2">{card.icon}</div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-3">
                <Button asChild variant="outline" className="w-full group">
                  <Link to={card.path} className="flex justify-between items-center">
                    <span>Open Application</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">All-in-One AI Chat Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featureCards.map((feature, index) => (
              <Card key={index} className="flex items-start p-4 gap-3">
                <div className="rounded-full p-2 bg-secondary/50">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button asChild>
              <Link to="/chat" className="flex items-center gap-2">
                <span>Try the All-in-One AI Chat</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
