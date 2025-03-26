
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BlogGeneratorPage = () => {
  const [topic, setTopic] = useState("");
  const [generatedBlog, setGeneratedBlog] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a blog topic",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockBlog = `# Understanding Quantum Computing: The Next Frontier in Technology

## Introduction

Quantum computing represents one of the most exciting frontiers in technology today. Unlike classical computers that use bits (0s and 1s), quantum computers leverage quantum bits or "qubits" that can exist in multiple states simultaneously, thanks to the principles of quantum mechanics. This fundamental difference gives quantum computers the potential to solve certain problems exponentially faster than their classical counterparts.

## The Basics of Quantum Computing

At its core, quantum computing relies on two key quantum mechanical principles:

1. **Superposition**: Unlike classical bits that must be either 0 or 1, qubits can exist in a state that is a combination of both 0 and 1 simultaneously.

2. **Entanglement**: When qubits become entangled, the state of one qubit becomes dependent on the state of another, no matter the distance between them.

These principles allow quantum computers to process vast amounts of information and explore multiple solutions simultaneously, giving them unprecedented computational power for specific types of problems.

## Real-World Applications

While still in its early stages, quantum computing shows promise in several areas:

### Cryptography

Quantum computers could potentially break many of the encryption systems we rely on today. However, they also offer the promise of quantum cryptography, which could provide virtually unbreakable encryption.

### Drug Discovery

By accurately modeling molecular interactions, quantum computers could dramatically accelerate drug discovery and development, potentially saving years of research time.

### Optimization Problems

From supply chain logistics to financial modeling, quantum computing excels at solving complex optimization problems with numerous variables.

## Current Challenges

Despite its promise, quantum computing faces significant hurdles:

- **Quantum Decoherence**: Qubits are extremely sensitive to environmental interference, making error rates a major challenge.
- **Scalability**: Building large-scale, stable quantum systems remains difficult.
- **Programming Paradigm**: Developing algorithms for quantum computers requires fundamentally different approaches compared to classical computing.

## The Future Landscape

As research continues, we're seeing rapid progress in quantum computing technology. Companies like IBM, Google, and Microsoft are investing heavily, with IBM already offering cloud access to quantum computers for researchers and developers.

## Conclusion

Quantum computing represents a paradigm shift in how we approach computation. While many challenges remain, the potential applications across industries make it one of the most transformative technologies on the horizon. As researchers continue to make breakthroughs in qubit stability, error correction, and quantum algorithms, we move closer to a future where quantum computing becomes an integral part of our technological landscape.`;

      setGeneratedBlog(mockBlog);
      setIsLoading(false);
    }, 3000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedBlog], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${topic.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Success",
      description: "Blog post downloaded successfully",
    });
  };

  const handlePublish = () => {
    toast({
      title: "Feature coming soon",
      description: "Publishing to blog platforms will be available soon!",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog Generator</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="blog-topic">Blog Topic</Label>
                  <Input
                    id="blog-topic"
                    placeholder="Enter a topic or title for your blog"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Blog
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Blog</h3>
                {generatedBlog && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button size="sm" onClick={handlePublish}>
                      <Send className="mr-2 h-4 w-4" />
                      Publish
                    </Button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">
                      Generating your blog post...
                    </p>
                  </div>
                </div>
              ) : generatedBlog ? (
                <Textarea
                  value={generatedBlog}
                  onChange={(e) => setGeneratedBlog(e.target.value)}
                  className="font-mono h-96 resize-none"
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <p>Enter a topic and generate your blog post</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogGeneratorPage;
