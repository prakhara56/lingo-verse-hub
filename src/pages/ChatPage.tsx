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
  Download,
  History,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase, messageToJson } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { chatbotService, ChatMessage as ApiChatMessage } from "@/services/chatbotService";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "image" | "code" | "audio";
  attachment?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  feature_type: string;
}

const convertDbToConversation = (item: any): Conversation => {
  const messages = Array.isArray(item.content) ? item.content.map((msg: any) => ({
    ...msg,
    timestamp: new Date(msg.timestamp)
  })) : [];

  return {
    id: item.id,
    title: item.title,
    messages: messages,
    created_at: item.created_at,
    feature_type: item.feature_type
  };
};

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState<string>("text");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  useEffect(() => {
    scrollToBottom();
    if (user) {
      fetchConversations();
    }
  }, [messages, user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const conversationsData = data ? data.map(convertDbToConversation) : [];
      setConversations(conversationsData);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    }
  };

  const saveConversation = async () => {
    if (!user || messages.length === 0) return;
    
    try {
      const title = messages[0]?.content.substring(0, 30) + (messages[0]?.content.length > 30 ? '...' : '') || "New conversation";
      const jsonMessages = messageToJson(messages);
      
      if (currentConversationId) {
        const { error } = await supabase
          .from('conversation_history')
          .update({
            content: jsonMessages,
            title
          })
          .eq('id', currentConversationId);
          
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('conversation_history')
          .insert({
            user_id: user.id,
            content: jsonMessages,
            title,
            feature_type: activeTab
          })
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCurrentConversationId(data[0].id);
        }
      }
      
      fetchConversations();
      
    } catch (error) {
      console.error("Error saving conversation:", error);
      toast({
        title: "Error",
        description: "Failed to save conversation",
        variant: "destructive",
      });
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('id', conversationId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const convertedData = convertDbToConversation(data);
        setMessages(convertedData.messages);
        setActiveTab(data.feature_type || "text");
        setCurrentConversationId(data.id);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsLoading(true);
      const uploadPromises = Array.from(files).map(file => chatbotService.uploadFile(file));
      const uploadedFilePaths = await Promise.all(uploadPromises);
      
      setUploadedFiles(prev => [...prev, ...uploadedFilePaths]);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Convert messages to API format
      const chatHistory: ApiChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call the real chatbot API
      const response = await chatbotService.sendMessage({
        message: input,
        history: chatHistory,
        uploaded_files: uploadedFiles
      });

      const aiMessage: Message = {
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        type: activeTab === "code" ? "code" : "text",
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Auto-save conversation after AI response
      setTimeout(() => {
        saveConversation();
      }, 500);
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Fallback to simulated response if API fails
      const fallbackMessage: Message = {
        role: "assistant",
        content: `I apologize, but I'm currently experiencing connection issues. This is a fallback response to your message: "${input}". Please try again in a moment.`,
        timestamp: new Date(),
        type: "text",
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
      
      toast({
        title: "Connection issue",
        description: "Using fallback response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setUploadedFiles([]);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
            {userProfile?.name && (
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {userProfile.name}!
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={activeTab} onValueChange={(value) => value && setActiveTab(value)}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="text" aria-label="Text generation">
                      <MessageSquare className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Text generation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="image" aria-label="Image generation">
                      <Image className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Image generation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="code" aria-label="Code assistant">
                      <Code className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Code assistant</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="audio" aria-label="Audio transcription">
                      <Music className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Audio transcription</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroup>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.json,.csv"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload files</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={clearChat}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Sheet>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <History className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Conversation history</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Conversation History</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-1">
                  {conversations.length > 0 ? (
                    conversations.map((conv) => (
                      <Button
                        key={conv.id}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => loadConversation(conv.id)}
                      >
                        <div>
                          <div className="font-medium">{conv.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(conv.created_at)}
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-4">No conversation history yet</p>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mb-4 p-2 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Uploaded files:</p>
            <div className="flex flex-wrap gap-1">
              {uploadedFiles.map((file, index) => (
                <span key={index} className="text-xs bg-primary/10 px-2 py-1 rounded">
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          <ChatMessage key={index} message={message} index={index} />
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
