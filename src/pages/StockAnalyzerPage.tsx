
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StockAnalyzerPage = () => {
  const [stockQuery, setStockQuery] = useState("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!stockQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock symbol or description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockAnalysis = `# Stock Analysis Report: ${stockQuery.toUpperCase()}

## Overview
${stockQuery.toUpperCase()} is currently trading at $245.76, up 1.2% today. The company has shown strong performance over the past quarter with revenue growth of 15%.

## Financial Health
- **Revenue**: $89.6 billion (Q2 2023)
- **EPS**: $3.28
- **P/E Ratio**: 28.4
- **Market Cap**: $2.3 trillion

## Technical Analysis
The stock is trading above its 50-day moving average, indicating a bullish trend. RSI is at 58, suggesting moderate momentum without being overbought.

## Recommendation
HOLD - The company has strong fundamentals but is trading at a premium valuation. Wait for a pullback before adding to position.

## Risk Factors
- Increasing regulatory scrutiny
- Competition in key markets
- Supply chain constraints affecting production capacity`;

      setAnalysis(mockAnalysis);
      setIsLoading(false);
    }, 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([analysis], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${stockQuery.toUpperCase()}_Analysis.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Success",
      description: "Analysis downloaded successfully",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Stock Analyzer</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="symbol">
                <TabsList className="mb-4">
                  <TabsTrigger value="symbol">Stock Symbol</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                </TabsList>

                <TabsContent value="symbol">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stock-symbol">Stock Symbol</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="stock-symbol"
                          placeholder="Enter stock symbol (e.g., AAPL)"
                          value={stockQuery}
                          onChange={(e) => setStockQuery(e.target.value)}
                        />
                        <Button onClick={handleAnalyze} disabled={isLoading}>
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="description">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stock-description">
                        Company Description
                      </Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="stock-description"
                          placeholder="Describe the company or industry"
                          value={stockQuery}
                          onChange={(e) => setStockQuery(e.target.value)}
                        />
                        <Button onClick={handleAnalyze} disabled={isLoading}>
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                {analysis && (
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
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : analysis ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-secondary/20 p-4 rounded-md overflow-auto max-h-[500px]">
                    {analysis}
                  </pre>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Enter a stock symbol or description to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default StockAnalyzerPage;
