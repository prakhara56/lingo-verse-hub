
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
  ArrowRight
} from 'lucide-react';

const appCards = [
  {
    title: "AI Chat",
    description: "Chat with different AI models like ChatGPT, Gemini, or Claude",
    icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
    path: "/chat"
  },
  {
    title: "Text Generation",
    description: "Generate creative writing, summaries, translations & more",
    icon: <FileText className="h-8 w-8 text-green-500" />,
    path: "/text-generation"
  },
  {
    title: "Image Generation",
    description: "Create beautiful images from text descriptions",
    icon: <Image className="h-8 w-8 text-purple-500" />,
    path: "/image-generation"
  },
  {
    title: "Code Assistant",
    description: "Get help with coding, debugging and code explanations",
    icon: <Code className="h-8 w-8 text-yellow-500" />,
    path: "/code-assistant"
  },
  {
    title: "Audio Transcription",
    description: "Convert speech to text with high accuracy",
    icon: <Music className="h-8 w-8 text-pink-500" />,
    path: "/audio-transcription"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appCards.map((card, index) => (
            <Card key={index} className="hover-scale overflow-hidden border border-border/50 shadow-sm">
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
      </section>
    </MainLayout>
  );
};

export default HomePage;
