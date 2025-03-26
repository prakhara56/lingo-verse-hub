
import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Send, 
  MessageSquare, 
  Image, 
  FileText, 
  Code, 
  Music, 
  Trash, 
  Loader2,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "image" | "code" | "audio";
  attachment?: string;
}

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState<string>("text");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate AI response based on the active tab
    setTimeout(() => {
      let aiMessage: Message;
      
      switch (activeTab) {
        case "image":
          aiMessage = {
            role: "assistant",
            content: "I've generated this image based on your prompt.",
            timestamp: new Date(),
            type: "image",
            attachment: "https://source.unsplash.com/random/600x400?sig=" + Math.random(), // Placeholder image
          };
          break;
        case "code":
          aiMessage = {
            role: "assistant",
            content: `Here's the code implementation for your request:\n\n\`\`\`javascript\nfunction calculateSum(arr) {\n  return arr.reduce((sum, current) => sum + current, 0);\n}\n\nconst numbers = [1, 2, 3, 4, 5];\nconst total = calculateSum(numbers);\nconsole.log(total); // Output: 15\n\`\`\``,
            timestamp: new Date(),
            type: "code",
          };
          break;
        case "audio":
          aiMessage = {
            role: "assistant",
            content: "I've transcribed the audio content. Here's what it says:",
            timestamp: new Date(),
            type: "text",
          };
          break;
        default:
          aiMessage = {
            role: "assistant",
            content: `This is a simulated response to your message: "${input}". In a real implementation, this would connect to an AI model API.`,
            timestamp: new Date(),
            type: "text",
          };
      }
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleDownload = (content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `chat-content-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Success",
      description: "Content downloaded successfully",
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="pb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={activeTab} onValueChange={(value) => value && setActiveTab(value)}>
              <ToggleGroupItem value="text" aria-label="Text generation">
                <MessageSquare className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="image" aria-label="Image generation">
                <Image className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="code" aria-label="Code assistant">
                <Code className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="audio" aria-label="Audio transcription">
                <Music className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button variant="outline" size="icon" onClick={clearChat}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden mb-4">
          <CardContent className="flex-1 overflow-y-auto p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsContent value="text" className="mt-0 h-full">
                <div className="h-full">
                  {renderChatMessages()}
                </div>
              </TabsContent>
              <TabsContent value="image" className="mt-0 h-full">
                <div className="h-full">
                  {renderChatMessages()}
                </div>
              </TabsContent>
              <TabsContent value="code" className="mt-0 h-full">
                <div className="h-full">
                  {renderChatMessages()}
                </div>
              </TabsContent>
              <TabsContent value="audio" className="mt-0 h-full">
                <div className="h-full">
                  {renderChatMessages()}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Input
            placeholder={getPlaceholderByTab()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
  
  function getPlaceholderByTab() {
    switch (activeTab) {
      case "text":
        return "Ask a question or request information...";
      case "image":
        return "Describe an image you'd like to generate...";
      case "code":
        return "Describe the code you need or ask a programming question...";
      case "audio":
        return "Ask about audio transcription...";
      default:
        return "Type your message here...";
    }
  }
  
  function renderChatMessages() {
    if (messages.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Start a conversation using the {getActiveTabName()}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.type === "image" && message.attachment && (
                <div className="mt-2">
                  <img 
                    src={message.attachment} 
                    alt="AI generated" 
                    className="rounded-md max-w-full h-auto"
                  />
                </div>
              )}
              
              {message.type === "code" && (
                <div className="mt-2">
                  <pre className="bg-black/20 p-2 rounded text-sm overflow-x-auto">
                    <code>{message.content.split("```")[1]}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleDownload(message.content.split("```")[1])}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground max-w-[80%] rounded-lg p-3">
              <div className="flex space-x-2 items-center">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary animation-delay-200"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary animation-delay-500"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    );
  }
  
  function getActiveTabName() {
    switch (activeTab) {
      case "text":
        return "Text Generation";
      case "image":
        return "Image Generation";
      case "code":
        return "Code Assistant";
      case "audio":
        return "Audio Transcription";
      default:
        return "Chat";
    }
  }
};

export default ChatPage;
