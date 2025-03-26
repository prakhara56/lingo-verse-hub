
import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Video, ExternalLink, Loader2, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CineNotesPage = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleYoutubeProcess = () => {
    if (!youtubeUrl.trim() || !youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      generateMockNotes();
      setIsLoading(false);
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("video/")) {
      toast({
        title: "Error",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      generateMockNotes();
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Video processed successfully",
      });
    }, 3000);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const generateMockNotes = () => {
    const mockNotes = `# Video Summary Notes

## Main Topics
1. Introduction to Machine Learning
2. Supervised vs. Unsupervised Learning
3. Common ML Algorithms
4. Practical Applications

## Detailed Notes

### Introduction to Machine Learning (0:00 - 12:45)
- Machine Learning is a subset of artificial intelligence focused on data-driven algorithms
- Key benefit: Programs can learn and improve without explicit programming
- Historical context: Arthur Samuel coined the term in 1959
- Recent advancements driven by increased computing power and data availability

### Supervised vs. Unsupervised Learning (12:46 - 25:30)
- **Supervised Learning:**
  - Uses labeled data for training
  - Examples: classification, regression problems
  - Popular algorithms: Linear regression, decision trees, neural networks
- **Unsupervised Learning:**
  - Works with unlabeled data
  - Focuses on finding patterns and relationships
  - Examples: clustering, dimensionality reduction
  - Popular algorithms: K-means, hierarchical clustering, PCA

### Common ML Algorithms (25:31 - 38:50)
- **Linear Regression:**
  - Used for predicting continuous values
  - Simple yet powerful for establishing relationships
- **Decision Trees:**
  - Tree-like model of decisions
  - Easy to interpret and visualize
- **Support Vector Machines:**
  - Effective for classification tasks
  - Works well with clear margins of separation
- **Neural Networks:**
  - Mimics human brain structure
  - Excellent for complex pattern recognition
  - Deep learning builds on this concept

### Practical Applications (38:51 - End)
- Healthcare: Disease prediction, medical imaging analysis
- Finance: Fraud detection, algorithmic trading
- Retail: Recommendation systems, inventory management
- Transportation: Autonomous vehicles, traffic prediction
- Communication: Natural language processing, translation services

## Key Takeaways
- Machine learning continues to transform industries across the board
- Starting with the right algorithm for your specific problem is crucial
- Quality data is often more important than algorithm complexity
- Ethical considerations must be integrated into ML development`;

    setNotes(mockNotes);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([notes], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "video-notes.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Success",
      description: "Notes downloaded successfully",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">CineNotes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="youtube">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="youtube" className="flex-1">
                    <Youtube className="mr-2 h-4 w-4" />
                    YouTube
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="youtube">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="youtube-url">YouTube URL</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="youtube-url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                        />
                        <Button 
                          onClick={handleYoutubeProcess} 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="upload">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover:bg-accent/20 transition-colors" onClick={triggerFileUpload}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="video/*"
                      />
                      <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports MP4, MOV, AVI (up to 500MB)
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Notes</h3>
                {notes && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                    className="gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">
                      Processing video and generating notes...
                    </p>
                  </div>
                </div>
              ) : notes ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-secondary/20 p-4 rounded-md overflow-auto max-h-[400px]">
                    {notes}
                  </pre>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <p>Upload a video or enter a YouTube URL to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CineNotesPage;
